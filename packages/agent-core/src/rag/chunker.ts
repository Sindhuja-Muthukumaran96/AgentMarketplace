import type { RagChunk, RagDocument } from '../types';

const MAX_CHUNK_CHARS = 1200;

/**
 * Splits a document into retrieval-sized chunks.
 *  - Knowledge-base markdown docs are split on `##` headings (one topic per chunk).
 *  - Source code documents are kept whole when small, or split on method/property
 *    boundaries when large, so a chunk never cuts a method signature in half.
 */
export function chunkDocument(doc: RagDocument): RagChunk[] {
  if (doc.category === 'knowledge-base') {
    return chunkMarkdown(doc);
  }
  return chunkSource(doc);
}

function chunkMarkdown(doc: RagDocument): RagChunk[] {
  const sections = doc.content.split(/\n(?=## )/g);
  return sections.map((section, index) => {
    const headingMatch = section.match(/^#{1,2}\s+(.+)$/m);
    return {
      id: `${doc.id}-${index}`,
      documentId: doc.id,
      source: doc.source,
      category: doc.category,
      heading: headingMatch ? headingMatch[1] : doc.id,
      content: section.trim()
    };
  });
}

function chunkSource(doc: RagDocument): RagChunk[] {
  if (doc.content.length <= MAX_CHUNK_CHARS) {
    return [
      {
        id: `${doc.id}-0`,
        documentId: doc.id,
        source: doc.source,
        category: doc.category,
        heading: doc.id,
        content: doc.content
      }
    ];
  }

  const blocks = doc.content.split(/\n\n(?=\s*\/\*\*|\s*(?:async|readonly|private|constructor|def |function ))/g);
  const chunks: RagChunk[] = [];
  let buffer = '';
  let index = 0;

  const flush = (): void => {
    if (buffer.trim().length > 0) {
      chunks.push({
        id: `${doc.id}-${index}`,
        documentId: doc.id,
        source: doc.source,
        category: doc.category,
        heading: doc.id,
        content: buffer.trim()
      });
      index += 1;
      buffer = '';
    }
  };

  for (const block of blocks) {
    if (buffer.length + block.length > MAX_CHUNK_CHARS) {
      flush();
    }
    buffer += `${block}\n\n`;
  }
  flush();

  return chunks;
}
