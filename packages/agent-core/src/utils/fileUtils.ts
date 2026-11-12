import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readFileIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function listFilesByExtension(dirPath: string, extension: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(extension))
    .map((file) => path.join(dirPath, file));
}

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'run';
}
