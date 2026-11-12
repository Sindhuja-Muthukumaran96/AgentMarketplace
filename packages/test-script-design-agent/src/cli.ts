#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { loadRepoConfig } from '@agent-marketplace/agent-core';

const program = new Command();

program
  .name('test-script-design-agent')
  .description(
    'Generates Playwright + TypeScript test scripts from acceptance criteria using a ' +
      'RAG-grounded, tool-calling agent loop, executing and self-healing until the script passes. ' +
      'Works against any target repository.'
  )
  .command('run')
  .option('--ac-file <path>', 'Path to a text/markdown file containing the acceptance criteria')
  .option('--ac-text <text>', 'Acceptance criteria provided inline as a string')
  .option('--target-repo <path>', 'Path to the repository to generate the test into (defaults to current directory)')
  .option('--max-retries <n>', 'Override the max generate/execute/retry attempts for this run')
  .option('--llm-provider <provider>', 'Override the LLM provider (mock|openai) for this run')
  .option('--test-command <template>', 'Override the test command template, e.g. "npx playwright test {file} --reporter=json"')
  .option('--headed', 'Run the generated test in headed (visible browser) mode')
  .action(async (options: {
    acFile?: string;
    acText?: string;
    targetRepo?: string;
    maxRetries?: string;
    llmProvider?: 'mock' | 'openai';
    testCommand?: string;
    headed?: boolean;
  }) => {
    let input: string;

    if (options.acFile) {
      const resolved = path.resolve(process.cwd(), options.acFile);
      if (!fs.existsSync(resolved)) {
        console.error(`Acceptance criteria file not found: ${resolved}`);
        process.exitCode = 1;
        return;
      }
      input = fs.readFileSync(resolved, 'utf-8');
    } else if (options.acText) {
      input = options.acText;
    } else {
      console.error('Provide acceptance criteria via --ac-file <path> or --ac-text "<text>".');
      process.exitCode = 1;
      return;
    }

    const config = loadRepoConfig({
      targetRepoRoot: options.targetRepo,
      maxRetries: options.maxRetries ? Number(options.maxRetries) : undefined,
      llmProvider: options.llmProvider,
      testCommand: options.testCommand,
      headed: options.headed
    });

    const { TestScriptDesignOrchestrator } = await import('./orchestrator');
    const bundledKnowledgeBaseDir = path.join(__dirname, '..', 'knowledge-base');
    const orchestrator = new TestScriptDesignOrchestrator(config, bundledKnowledgeBaseDir);
    const record = await orchestrator.run(input);

    process.exitCode = record.success ? 0 : 1;
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
