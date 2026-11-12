import crypto from 'node:crypto';
import type { ChatMessage, LlmProvider, ToolCall, ToolDefinition, ToolResult, ToolTrace } from '../types';

export interface ToolExecutionOutcome {
  result: ToolResult;
  /** Set by a tool that produces the final deliverable (e.g. writes a file) */
  terminal?: { filePath: string; code: string };
}

export type ToolExecutorFn = (call: ToolCall) => ToolExecutionOutcome;

/**
 * Generic LLM tool-calling loop, reusable by any agent-marketplace plugin:
 * keeps calling the LLM and executing whatever tool(s) it requests, feeding
 * results back as `tool` messages, until a "terminal" tool is called (one that
 * reports `terminal` in its outcome) or a safety iteration cap is hit.
 */
export async function runToolLoop(
  llmProvider: LlmProvider,
  messages: ChatMessage[],
  tools: ToolDefinition[],
  executeTool: ToolExecutorFn,
  options: { maxIterations?: number } = {}
): Promise<{ toolTrace: ToolTrace[]; terminalFilePath: string | null; terminalCode: string | null }> {
  const maxIterations = options.maxIterations ?? 10;
  const toolTrace: ToolTrace[] = [];
  let terminalFilePath: string | null = null;
  let terminalCode: string | null = null;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const turn = await llmProvider.nextTurn(messages, tools);
    messages.push(turn.message);

    if (turn.toolCalls.length === 0) {
      break;
    }

    for (const call of turn.toolCalls) {
      const outcome = executeTool({ ...call, id: call.id || crypto.randomUUID() });
      toolTrace.push({ call, result: outcome.result });
      messages.push({
        role: 'tool',
        content: outcome.result.content,
        toolCallId: outcome.result.toolCallId,
        name: outcome.result.name
      });

      if (outcome.terminal) {
        terminalFilePath = outcome.terminal.filePath;
        terminalCode = outcome.terminal.code;
      }
    }

    if (terminalFilePath) {
      break;
    }
  }

  return { toolTrace, terminalFilePath, terminalCode };
}
