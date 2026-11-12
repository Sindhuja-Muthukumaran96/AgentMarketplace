import path from 'node:path';
import fs from 'node:fs';
import type { RagDocument } from '../types';

/** Loads every `*.md` file in each given directory as a 'knowledge-base' document */
export function loadMarkdownDocuments(dirs: string[], repoRoot: string): RagDocument[] {
  const documents: RagDocument[] = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const filePath = path.join(dir, file);
      documents.push({
        id: path.basename(file, '.md'),
        source: path.relative(repoRoot, filePath),
        category: 'knowledge-base',
        content: fs.readFileSync(filePath, 'utf-8')
      });
    }
  }
  return documents;
}

/** Loads every file matching `extensions` in each given directory as a 'source' document */
export function loadSourceDocuments(dirs: Array<string | null>, extensions: string[], repoRoot: string): RagDocument[] {
  const documents: RagDocument[] = [];
  for (const dir of dirs) {
    if (!dir || !fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!extensions.some((ext) => file.endsWith(ext))) continue;
      const filePath = path.join(dir, file);
      if (!fs.statSync(filePath).isFile()) continue;
      documents.push({
        id: `source-${path.basename(file)}`,
        source: path.relative(repoRoot, filePath),
        category: 'source',
        content: fs.readFileSync(filePath, 'utf-8')
      });
    }
  }
  return documents;
}

/** Loads a single known file (e.g. a specific fixtures file) if it exists */
export function loadSingleSourceFile(filePath: string | null, repoRoot: string): RagDocument | null {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  return {
    id: `source-${path.basename(filePath)}`,
    source: path.relative(repoRoot, filePath),
    category: 'source',
    content: fs.readFileSync(filePath, 'utf-8')
  };
}
