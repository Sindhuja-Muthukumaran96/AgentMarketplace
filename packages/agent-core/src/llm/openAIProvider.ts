import type { ChatMessage, LlmProvider, LlmTurnResult, ToolCall, ToolDefinition } from '../types';
import type { ResolvedRepoConfig } from '../types';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/** Real LLM provider backed by the OpenAI Chat Completions API with native tool calling */
export class OpenAiLlmProvider implements LlmProvider {
  readonly name = 'openai';

  constructor(private apiKey: string | undefined, private model: string) {}

  async nextTurn(messages: ChatMessage[], tools: ToolDefinition[]): Promise<LlmTurnResult> {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: this.apiKey });

    const response = await client.chat.completions.create({
      model: this.model,
      messages: messages.map(toOpenAiMessage),
      tools,
      tool_choice: 'auto'
    });

    const choice = response.choices[0];
    const rawToolCalls = choice.message.tool_calls || [];
    const toolCalls: ToolCall[] = rawToolCalls.map((toolCall) => ({
      id: toolCall.id,
      name: toolCall.function.name,
      arguments: safeParseArguments(toolCall.function.arguments)
    }));

    return {
      message: { role: 'assistant', content: choice.message.content || '', toolCalls },
      toolCalls,
      isFinal: toolCalls.length === 0
    };
  }
}

export function createOpenAiProvider(config: ResolvedRepoConfig): OpenAiLlmProvider {
  return new OpenAiLlmProvider(config.openAiApiKey, config.openAiModel);
}

function safeParseArguments(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toOpenAiMessage(message: ChatMessage): ChatCompletionMessageParam {
  if (message.role === 'tool') {
    return { role: 'tool', content: message.content, tool_call_id: message.toolCallId || '' };
  }
  if (message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0) {
    return {
      role: 'assistant',
      content: message.content,
      tool_calls: message.toolCalls.map((call) => ({
        id: call.id,
        type: 'function',
        function: { name: call.name, arguments: JSON.stringify(call.arguments) }
      }))
    };
  }
  if (message.role === 'system') {
    return { role: 'system', content: message.content };
  }
  if (message.role === 'assistant') {
    return { role: 'assistant', content: message.content };
  }
  return { role: 'user', content: message.content };
}
