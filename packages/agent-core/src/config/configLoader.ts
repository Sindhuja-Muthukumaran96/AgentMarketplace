import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import type { RepoConfigFile, ResolvedRepoConfig } from '../types';

dotenv.config();

const PAGE_OBJECT_CANDIDATES = ['src/pages', 'pages', 'src/page-objects', 'page-objects', 'src/pom'];
const FIXTURES_CANDIDATES = ['src/fixtures', 'fixtures', 'test/fixtures', 'tests/fixtures'];
const UTILS_CANDIDATES = ['src/utils', 'utils', 'src/helpers', 'helpers'];
const TESTS_CANDIDATES = ['tests', 'test', 'e2e', 'cypress/e2e', 'playwright-tests'];

function firstExisting(repoRoot: string, candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(repoRoot, candidate))) {
      return candidate;
    }
  }
  return null;
}

function readRepoConfigFile(repoRoot: string): RepoConfigFile {
  const configPath = path.join(repoRoot, 'agent.config.json');
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8')) as RepoConfigFile;
  } catch {
    return {};
  }
}

export interface ConfigOverrides {
  targetRepoRoot?: string;
  llmProvider?: 'openai' | 'mock';
  embeddingProvider?: 'openai' | 'local';
  maxRetries?: number;
  topK?: number;
  headed?: boolean;
  testCommand?: string;
}

/**
 * Resolves a target repository's conventions by layering, in increasing priority:
 *   1. Auto-detected common folder names (works out of the box for most repos).
 *   2. `agent.config.json` in the target repo root, if present (explicit override).
 *   3. CLI flags / env vars for this specific run.
 *
 * This is what lets the same plugin run against *any* repository without
 * hardcoding one project's folder layout.
 */
export function loadRepoConfig(overrides: ConfigOverrides = {}): ResolvedRepoConfig {
  const targetRepoRoot = path.resolve(overrides.targetRepoRoot || process.cwd());
  const fileConfig = readRepoConfigFile(targetRepoRoot);

  const pageObjectsDir = fileConfig.pageObjectsDir ?? firstExisting(targetRepoRoot, PAGE_OBJECT_CANDIDATES);
  const fixturesDir = fileConfig.fixturesDir ?? firstExisting(targetRepoRoot, FIXTURES_CANDIDATES);
  const utilsDir = fileConfig.utilsDir ?? firstExisting(targetRepoRoot, UTILS_CANDIDATES);
  const testsDir = fileConfig.testsDir ?? firstExisting(targetRepoRoot, TESTS_CANDIDATES);
  const generatedTestsSubDir = fileConfig.generatedTestsSubDir
    ?? (testsDir ? path.join(testsDir, 'ui', 'generated') : path.join('tests', 'ui', 'generated'));

  return {
    targetRepoRoot,
    pageObjectsDir: pageObjectsDir ? path.join(targetRepoRoot, pageObjectsDir) : null,
    fixturesDir: fixturesDir ? path.join(targetRepoRoot, fixturesDir) : null,
    utilsDir: utilsDir ? path.join(targetRepoRoot, utilsDir) : null,
    testsDir: testsDir ? path.join(targetRepoRoot, testsDir) : null,
    generatedTestsSubDir,
    knowledgeBaseDirs: (fileConfig.knowledgeBaseDirs || []).map((dir) => path.join(targetRepoRoot, dir)),
    testCommand: overrides.testCommand
      || fileConfig.testCommand
      || process.env.AGENT_TEST_COMMAND
      || 'npx playwright test {file} --project=chromium --reporter=json',
    llmProvider: overrides.llmProvider || (process.env.AGENT_LLM_PROVIDER as 'openai' | 'mock') || 'mock',
    embeddingProvider: overrides.embeddingProvider || (process.env.AGENT_EMBEDDING_PROVIDER as 'openai' | 'local') || 'local',
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiModel: process.env.AGENT_OPENAI_MODEL || 'gpt-4o-mini',
    openAiEmbeddingModel: process.env.AGENT_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    maxRetries: overrides.maxRetries ?? Number(process.env.AGENT_MAX_RETRIES || 3),
    topK: overrides.topK ?? Number(process.env.AGENT_TOP_K || 5),
    headed: overrides.headed ?? process.env.AGENT_HEADED === 'true'
  };
}
