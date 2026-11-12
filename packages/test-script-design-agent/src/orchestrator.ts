import path from 'node:path';
import type { AgentRunRecord, ChatMessage, GenerationAttempt, ResolvedRepoConfig, ToolTrace } from '@agent-marketplace/agent-core';
import {
  Logger,
  Retriever,
  createEmbeddingProvider,
  createOpenAiProvider,
  runToolLoop,
  buildCommandArgs,
  runCommand,
  generateReport,
  loadMarkdownDocuments,
  loadSourceDocuments
} from '@agent-marketplace/agent-core';
import { buildInitialUserPrompt, buildRetryUserPrompt } from '@agent-marketplace/agent-core';
import { toolDefinitions, TOOL_NAMES } from './tools/toolDefinitions';
import { executeTool } from './tools/toolExecutor';
import { SYSTEM_PROMPT, GENERATION_INSTRUCTION, RETRY_INSTRUCTION } from './llm/prompts';
import { MockLlmProvider } from './llm/mockProvider';
import { parsePlaywrightJsonResult } from './executor/playwrightResultParser';

const MAX_TOOL_LOOP_ITERATIONS = 10;

/**
 * The plugin's core control loop, implementing the 5-step flow against *any*
 * target repository's resolved configuration:
 *   1. Accept acceptance criteria as input.
 *   2. RAG retrieves grounding context from this plugin's bundled knowledge
 *      base + the target repo's own live Page Objects/fixtures/test data.
 *   3. The LLM uses tools to produce a test script.
 *   4. The script is only considered successful once it actually passes when
 *      executed with the target repo's configured test command — otherwise the
 *      failure is fed back and the LLM retries.
 *   5. A report is generated summarizing the whole run.
 */
export class TestScriptDesignOrchestrator {
  constructor(private config: ResolvedRepoConfig, private bundledKnowledgeBaseDir: string) {}

  async run(input: string): Promise<AgentRunRecord> {
    const runId = new Date().toISOString().replace(/[:.]/g, '-');
    const startedAt = new Date().toISOString();
    const { config } = this;

    Logger.step('1/5', 'Acceptance criteria received.');

    Logger.step('2/5', 'Retrieving relevant context via RAG...');
    const documents = [
      ...loadMarkdownDocuments([this.bundledKnowledgeBaseDir, ...config.knowledgeBaseDirs], config.targetRepoRoot),
      ...loadSourceDocuments([config.pageObjectsDir], ['.ts'], config.targetRepoRoot),
      ...loadSourceDocuments([config.fixturesDir], ['.ts'], config.targetRepoRoot),
      ...loadSourceDocuments([config.utilsDir], ['.ts'], config.targetRepoRoot)
    ];

    const embeddingProvider = createEmbeddingProvider(config);
    const cachePath = path.join(config.targetRepoRoot, '.agent-cache', 'test-script-design-agent-vector-index.json');
    const retriever = new Retriever(embeddingProvider, cachePath);
    await retriever.buildIndex(documents);
    const retrievedChunks = await retriever.retrieve(input, config.topK);
    retrievedChunks.forEach((chunk, i) =>
      Logger.rag(`  #${i + 1} ${chunk.source}${chunk.heading ? ` \u203a ${chunk.heading}` : ''} (score=${chunk.score.toFixed(3)})`)
    );

    const llmProvider = config.llmProvider === 'openai' && config.openAiApiKey ? createOpenAiProvider(config) : new MockLlmProvider();
    if (config.llmProvider === 'openai' && !config.openAiApiKey) {
      Logger.warn('llmProvider is "openai" but no OPENAI_API_KEY was found — falling back to the offline Mock provider.');
    }
    Logger.llm(`Using "${llmProvider.name}" provider.`);

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildInitialUserPrompt(input, retrievedChunks, GENERATION_INSTRUCTION) }
    ];

    const attempts: GenerationAttempt[] = [];
    let success = false;
    let finalFilePath: string | null = null;
    let finalCode: string | null = null;

    Logger.step('3-4/5', `Generating test script (max ${config.maxRetries} attempt(s))...`);

    for (let attemptNumber = 1; attemptNumber <= config.maxRetries; attemptNumber += 1) {
      Logger.step(`ATTEMPT ${attemptNumber}`, 'LLM is reasoning with tools...');

      const { toolTrace, terminalFilePath, terminalCode } = await runToolLoop(
        llmProvider,
        messages,
        toolDefinitions,
        (call) => executeTool(config, call),
        { maxIterations: MAX_TOOL_LOOP_ITERATIONS }
      );

      if (!terminalFilePath || !terminalCode) {
        attempts.push({ attemptNumber, toolTrace, generatedFilePath: null, generatedCode: null, execution: null });
        Logger.error(`LLM did not produce a test file via ${TOOL_NAMES.WRITE_TEST_FILE} this attempt.`);
        break;
      }

      const normalizedPath = terminalFilePath.split('\\').join('/');
      const { command, args } = buildCommandArgs(config.testCommand, { file: normalizedPath });
      if (config.headed) args.push('--headed');
      Logger.exec(`${command} ${args.join(' ')}`);
      const { rawOutput, durationMs } = await runCommand(config.targetRepoRoot, command, args);
      const execution = parsePlaywrightJsonResult(rawOutput, durationMs);

      if (execution.passed) {
        Logger.success(`Execution passed: ${execution.passedChecks}/${execution.totalChecks} checks in ${(durationMs / 1000).toFixed(1)}s.`);
      } else {
        Logger.warn(`Execution failed: ${execution.failedChecks}/${execution.totalChecks} checks failed in ${(durationMs / 1000).toFixed(1)}s.`);
      }

      attempts.push({ attemptNumber, toolTrace, generatedFilePath: terminalFilePath, generatedCode: terminalCode, execution });
      finalFilePath = terminalFilePath;
      finalCode = terminalCode;

      if (execution.passed) {
        success = true;
        break;
      }

      if (attemptNumber < config.maxRetries) {
        Logger.warn(`Attempt ${attemptNumber} failed. Feeding execution failure back to the LLM for a retry...`);
        messages.push({ role: 'user', content: buildRetryUserPrompt(execution.failureMessages, attemptNumber + 1, RETRY_INSTRUCTION) });
      } else {
        Logger.error(`Attempt ${attemptNumber} failed and max retries (${config.maxRetries}) reached.`);
      }
    }

    Logger.step('5/5', 'Generating run report...');

    const record: AgentRunRecord = {
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
      input,
      retrieval: { query: input, chunks: retrievedChunks },
      attempts,
      success,
      finalFilePath,
      finalCode
    };

    const reportsDir = path.join(config.targetRepoRoot, 'agent-reports');
    generateReport(record, reportsDir);

    return record;
  }
}
