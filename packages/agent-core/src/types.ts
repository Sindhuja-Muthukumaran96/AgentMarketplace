/**
 * Shared type definitions for the agent-marketplace engine.
 * Deliberately generic: no plugin here assumes a specific repo's folder layout.
 */

export interface RagDocument {
  id: string;
  source: string;
  category: 'knowledge-base' | 'source';
  content: string;
}

export interface RagChunk {
  id: string;
  documentId: string;
  source: string;
  category: RagDocument['category'];
  heading?: string;
  content: string;
}

export interface EmbeddedChunk extends RagChunk {
  vector: number[];
}

export interface RetrievedChunk extends RagChunk {
  score: number;
}

export interface EmbeddingProvider {
  readonly name: string;
  embed(texts: string[]): Promise<number[][]>;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  content: string;
}

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  name?: string;
}

export interface LlmTurnResult {
  message: ChatMessage;
  toolCalls: ToolCall[];
  isFinal: boolean;
}

export interface LlmProvider {
  readonly name: string;
  nextTurn(messages: ChatMessage[], tools: ToolDefinition[]): Promise<LlmTurnResult>;
}

export interface ToolTrace {
  call: ToolCall;
  result: ToolResult;
}

/** Outcome of executing a generated artifact against a real command (e.g. a test runner) */
export interface ExecutionResult {
  passed: boolean;
  durationMs: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  rawOutput: string;
  failureMessages: string[];
}

export interface GenerationAttempt {
  attemptNumber: number;
  toolTrace: ToolTrace[];
  generatedFilePath: string | null;
  generatedCode: string | null;
  execution: ExecutionResult | null;
}

export interface AgentRunRecord {
  runId: string;
  startedAt: string;
  finishedAt: string;
  input: string;
  retrieval: {
    query: string;
    chunks: RetrievedChunk[];
  };
  attempts: GenerationAttempt[];
  success: boolean;
  finalFilePath: string | null;
  finalCode: string | null;
}

/** Resolved, absolute-path configuration for a single target repository */
export interface ResolvedRepoConfig {
  targetRepoRoot: string;
  pageObjectsDir: string | null;
  fixturesDir: string | null;
  utilsDir: string | null;
  testsDir: string | null;
  generatedTestsSubDir: string;
  knowledgeBaseDirs: string[];
  testCommand: string;
  llmProvider: 'openai' | 'mock';
  embeddingProvider: 'openai' | 'local';
  openAiApiKey?: string;
  openAiModel: string;
  openAiEmbeddingModel: string;
  maxRetries: number;
  topK: number;
  headed: boolean;
}

/** Raw shape of an optional `agent.config.json` found in a target repo */
export interface RepoConfigFile {
  pageObjectsDir?: string;
  fixturesDir?: string;
  utilsDir?: string;
  testsDir?: string;
  generatedTestsSubDir?: string;
  knowledgeBaseDirs?: string[];
  testCommand?: string;
}
