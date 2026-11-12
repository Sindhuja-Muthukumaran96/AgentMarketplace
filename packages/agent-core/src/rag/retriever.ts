import type { EmbeddedChunk, EmbeddingProvider, RagChunk, RagDocument, RetrievedChunk } from '../types';
import { chunkDocument } from './chunker';
import { InMemoryVectorStore } from './vectorStore';
import { Logger } from '../utils/logger';
import { ensureDir, hashContent, readFileIfExists, writeFile } from '../utils/fileUtils';
import path from 'node:path';

interface VectorCache {
  signature: string;
  embeddingProvider: string;
  chunks: EmbeddedChunk[];
}

/**
 * The RAG "retriever": chunk -> embed -> index documents supplied by the caller,
 * then answer `retrieve(query)` with the most relevant chunks. Framework/plugin
 * agnostic — callers decide *which* documents to index (knowledge base + live
 * source files from whatever directories their config resolved to).
 */
export class Retriever {
  private vectorStore = new InMemoryVectorStore();
  private ready = false;

  constructor(private embeddingProvider: EmbeddingProvider, private cachePath?: string) {}

  async buildIndex(documents: RagDocument[]): Promise<void> {
    const chunks: RagChunk[] = documents.flatMap((doc) => chunkDocument(doc));
    const signature = hashContent(chunks.map((c) => c.id + c.content).join('|'));

    const cached = this.cachePath ? this.loadCache() : null;
    if (cached && cached.signature === signature && cached.embeddingProvider === this.embeddingProvider.name) {
      Logger.rag(`Vector index cache hit (${cached.chunks.length} chunks, provider=${cached.embeddingProvider}).`);
      this.vectorStore.addAll(cached.chunks);
      this.ready = true;
      return;
    }

    Logger.rag(
      `Building vector index: ${documents.length} documents -> ${chunks.length} chunks ` +
        `(embedding provider=${this.embeddingProvider.name}).`
    );

    const vectors = await this.embeddingProvider.embed(chunks.map((c) => `${c.heading ?? ''}\n${c.content}`));
    const embedded: EmbeddedChunk[] = chunks.map((chunk, index) => ({ ...chunk, vector: vectors[index] }));

    this.vectorStore.addAll(embedded);
    if (this.cachePath) {
      this.saveCache({ signature, embeddingProvider: this.embeddingProvider.name, chunks: embedded });
    }
    this.ready = true;
  }

  async retrieve(query: string, topK: number): Promise<RetrievedChunk[]> {
    if (!this.ready) {
      throw new Error('Retriever.buildIndex() must be called before retrieve().');
    }
    const [queryVector] = await this.embeddingProvider.embed([query]);
    return this.vectorStore.search(queryVector, topK);
  }

  private loadCache(): VectorCache | null {
    const raw = this.cachePath ? readFileIfExists(this.cachePath) : null;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as VectorCache;
    } catch {
      return null;
    }
  }

  private saveCache(cache: VectorCache): void {
    if (!this.cachePath) return;
    ensureDir(path.dirname(this.cachePath));
    writeFile(this.cachePath, JSON.stringify(cache));
  }
}
