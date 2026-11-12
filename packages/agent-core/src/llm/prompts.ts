import type { RetrievedChunk } from '../types';

export const INPUT_START = '<<<AGENT_INPUT>>>';
export const INPUT_END = '<<<END_AGENT_INPUT>>>';
export const EXECUTION_FEEDBACK_START = '<<<EXECUTION_FAILURE_FEEDBACK>>>';
export const EXECUTION_FEEDBACK_END = '<<<END_EXECUTION_FAILURE_FEEDBACK>>>';

export function formatRagContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return '(no relevant context retrieved)';
  }
  return chunks
    .map(
      (chunk, index) =>
        `--- Retrieved Context #${index + 1} (source: ${chunk.source}, relevance: ${chunk.score.toFixed(3)}) ---\n${chunk.content}`
    )
    .join('\n\n');
}

/** Generic initial user prompt: the raw input, clearly delimited, plus RAG grounding context */
export function buildInitialUserPrompt(input: string, ragContext: RetrievedChunk[], instruction: string): string {
  return `${INPUT_START}\n${input.trim()}\n${INPUT_END}\n\n` +
    `Relevant retrieved context from the knowledge base and the live codebase:\n\n` +
    `${formatRagContext(ragContext)}\n\n${instruction}`;
}

/** Generic retry prompt: the real failure output, clearly delimited, asking for a fix */
export function buildRetryUserPrompt(failureMessages: string[], attemptNumber: number, instruction: string): string {
  return `Attempt ${attemptNumber - 1} failed during execution. Fix it.\n\n` +
    `${EXECUTION_FEEDBACK_START}\n${failureMessages.join('\n---\n')}\n${EXECUTION_FEEDBACK_END}\n\n${instruction}`;
}
