import type { EmbeddingProvider, ResolvedRepoConfig } from '../types';

const VECTOR_DIMENSIONS = 384;
const TOKEN_REGEX = /[a-zA-Z][a-zA-Z0-9]{1,}/g;

/**
 * Deterministic, dependency-free embedding provider using the "hashing trick"
 * (fixed-size hashed bag-of-words, L2-normalized). Lets the full RAG pipeline
 * run completely offline/deterministically with no API key required, while
 * remaining a drop-in swap for a real neural embedding model.
 */
export class LocalHashEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local-hash';

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => this.embedOne(text));
  }

  private embedOne(text: string): number[] {
    const vector = new Array<number>(VECTOR_DIMENSIONS).fill(0);
    const tokens = text.toLowerCase().match(TOKEN_REGEX) || [];
    for (const token of tokens) {
      vector[this.hashToken(token) % VECTOR_DIMENSIONS] += 1;
    }
    return this.normalize(vector);
  }

  private hashToken(token: string): number {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
  }

  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    return magnitude === 0 ? vector : vector.map((value) => value / magnitude);
  }
}

/** Real neural embedding provider backed by the OpenAI Embeddings API */
export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';

  constructor(private apiKey: string | undefined, private model: string) {}

  async embed(texts: string[]): Promise<number[][]> {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: this.apiKey });
    const response = await client.embeddings.create({ model: this.model, input: texts });
    return response.data.map((item) => item.embedding);
  }
}

export function createEmbeddingProvider(config: ResolvedRepoConfig): EmbeddingProvider {
  if (config.embeddingProvider === 'openai' && config.openAiApiKey) {
    return new OpenAiEmbeddingProvider(config.openAiApiKey, config.openAiEmbeddingModel);
  }
  return new LocalHashEmbeddingProvider();
}
