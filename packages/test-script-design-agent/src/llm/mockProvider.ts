import crypto from 'node:crypto';
import type { ChatMessage, LlmProvider, LlmTurnResult, ToolDefinition } from '@agent-marketplace/agent-core';
import { INPUT_START, INPUT_END, EXECUTION_FEEDBACK_START } from '@agent-marketplace/agent-core';
import { TOOL_NAMES } from '../tools/toolDefinitions';
import { detectScenario, generateScenarioCode, scenarioToPageObject } from './mockScenarios';

/**
 * Offline, deterministic stand-in for a real LLM. Drives the exact same
 * tool-calling protocol a real model would (list -> inspect -> write), so the
 * orchestrator code is identical whether the configured provider is "mock" or
 * "openai". See mockScenarios.ts for the demo-only scope of this provider.
 */
export class MockLlmProvider implements LlmProvider {
  readonly name = 'mock';

  async nextTurn(messages: ChatMessage[], _tools: ToolDefinition[]): Promise<LlmTurnResult> {
    const acceptanceCriteria = extractInput(messages);
    const scenario = detectScenario(acceptanceCriteria);

    if (isRetryTurn(messages)) {
      const { fileName, testCode } = generateScenarioCode(scenario, 'fixed');
      return toolTurn(TOOL_NAMES.WRITE_TEST_FILE, {
        fileName,
        testCode,
        summary: `Corrected "${scenario}" test using real execution failure feedback.`
      });
    }

    if (!wasToolCalled(messages, TOOL_NAMES.LIST_PAGE_OBJECTS)) {
      return toolTurn(TOOL_NAMES.LIST_PAGE_OBJECTS, {});
    }
    if (!wasToolCalled(messages, TOOL_NAMES.GET_PAGE_OBJECT_SOURCE)) {
      return toolTurn(TOOL_NAMES.GET_PAGE_OBJECT_SOURCE, { pageObjectName: scenarioToPageObject(scenario) });
    }
    if (!wasToolCalled(messages, TOOL_NAMES.GET_FIXTURE_SOURCE)) {
      return toolTurn(TOOL_NAMES.GET_FIXTURE_SOURCE, {});
    }
    if (!wasToolCalled(messages, TOOL_NAMES.WRITE_TEST_FILE)) {
      const { fileName, testCode } = generateScenarioCode(scenario, 'initial');
      return toolTurn(TOOL_NAMES.WRITE_TEST_FILE, {
        fileName,
        testCode,
        summary: `Initial generation for "${scenario}" based on retrieved standards.`
      });
    }

    return { message: { role: 'assistant', content: 'Test script generation complete.' }, toolCalls: [], isFinal: true };
  }
}

function toolTurn(name: string, args: Record<string, unknown>): LlmTurnResult {
  const call = { id: crypto.randomUUID(), name, arguments: args };
  return { message: { role: 'assistant', content: '', toolCalls: [call] }, toolCalls: [call], isFinal: false };
}

function wasToolCalled(messages: ChatMessage[], toolName: string): boolean {
  return messages.some((message) => message.role === 'assistant' && message.toolCalls?.some((call) => call.name === toolName));
}

function isRetryTurn(messages: ChatMessage[]): boolean {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  return Boolean(lastUserMessage?.content.includes(EXECUTION_FEEDBACK_START));
}

function extractInput(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  if (!firstUserMessage) return '';
  const start = firstUserMessage.content.indexOf(INPUT_START);
  const end = firstUserMessage.content.indexOf(INPUT_END);
  if (start === -1 || end === -1) return firstUserMessage.content;
  return firstUserMessage.content.slice(start + INPUT_START.length, end).trim();
}
