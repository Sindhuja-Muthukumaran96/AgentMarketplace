import type { EmbeddedChunk, RagChunk, RetrievedChunk } from '../types';

/**
 * Minimal in-memory vector store using a linear cosine-similarity scan — fast
 * enough for a few hundred chunks and avoids needing an external vector database.
 */
export class InMemoryVectorStore {
  private chunks: EmbeddedChunk[] = [];

  addAll(chunks: EmbeddedChunk[]): void {
    this.chunks.push(...chunks);
  }

  size(): number {
    return this.chunks.length;
  }

  isEmpty(): boolean {
    return this.chunks.length === 0;
  }

  search(queryVector: number[], topK: number): RetrievedChunk[] {
    const scored = this.chunks.map((chunk) => ({ chunk, score: cosineSimilarity(queryVector, chunk.vector) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(({ chunk, score }) => {
      const chunkWithoutVector: RagChunk = {
        id: chunk.id,
        documentId: chunk.documentId,
        source: chunk.source,
        category: chunk.category,
        heading: chunk.heading,
        content: chunk.content
      };
      return { ...chunkWithoutVector, score };
    });
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
