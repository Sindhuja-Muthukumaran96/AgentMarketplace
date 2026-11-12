import fs from 'node:fs';
import path from 'node:path';
import type { ResolvedRepoConfig, ToolCall } from '@agent-marketplace/agent-core';
import { Logger, listFilesByExtension, slugify, writeFile } from '@agent-marketplace/agent-core';
import type { ToolExecutionOutcome } from '@agent-marketplace/agent-core';
import { TOOL_NAMES } from './toolDefinitions';

interface PageObjectSummary {
  className: string;
  file: string;
  publicMethods: string[];
}

function parsePageObjectFile(filePath: string, repoRoot: string): PageObjectSummary | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const classMatch = content.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
  if (!classMatch) return null;

  const methodRegex = /^\s{2}(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*:\s*([^{]+)\{/gm;
  const publicMethods: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = methodRegex.exec(content)) !== null) {
    const [, methodName, params, returnType] = match;
    if (methodName === 'constructor') continue;
    publicMethods.push(`${methodName}(${params.trim()}): ${returnType.trim()}`);
  }

  return { className: classMatch[1], file: path.relative(repoRoot, filePath), publicMethods };
}

function listPageObjects(config: ResolvedRepoConfig): PageObjectSummary[] {
  if (!config.pageObjectsDir) return [];
  return listFilesByExtension(config.pageObjectsDir, '.ts')
    .map((filePath) => parsePageObjectFile(filePath, config.targetRepoRoot))
    .filter((entry): entry is PageObjectSummary => entry !== null && !/^Base/i.test(entry.className));
}

function getPageObjectSource(config: ResolvedRepoConfig, pageObjectName: string): string {
  if (!config.pageObjectsDir) return 'ERROR: No page objects directory configured/detected for this repository.';
  const safeName = pageObjectName.replace(/[^a-zA-Z0-9]/g, '');
  const filePath = path.join(config.pageObjectsDir, `${safeName}.ts`);
  if (!fs.existsSync(filePath)) {
    return `ERROR: No page object file found for "${pageObjectName}". Call ${TOOL_NAMES.LIST_PAGE_OBJECTS} first.`;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function getFixtureSource(config: ResolvedRepoConfig): string {
  if (!config.fixturesDir) return 'ERROR: No fixtures directory configured/detected for this repository.';
  const candidates = listFilesByExtension(config.fixturesDir, '.ts');
  if (candidates.length === 0) return 'ERROR: No fixture files found.';
  return candidates.map((file) => fs.readFileSync(file, 'utf-8')).join('\n\n');
}

function getTestDataUtilSource(config: ResolvedRepoConfig): string {
  if (!config.utilsDir) return 'ERROR: No utils directory configured/detected for this repository.';
  const match = listFilesByExtension(config.utilsDir, '.ts').find((file) => /test.?data/i.test(file));
  if (!match) return 'ERROR: No test-data factory/utility file found.';
  return fs.readFileSync(match, 'utf-8');
}

export interface WriteTestFileOutcome {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  testCode: string;
}

function writeTestFile(config: ResolvedRepoConfig, fileName: string, testCode: string): WriteTestFileOutcome {
  const slug = slugify(fileName);
  const relativePath = path.join(config.generatedTestsSubDir, `${slug}.spec.ts`);
  const absolutePath = path.join(config.targetRepoRoot, relativePath);
  writeFile(absolutePath, testCode);
  return { absolutePath, relativePath, fileName: slug, testCode };
}

/** Executes a single tool call against the resolved target-repo configuration */
export function executeTool(
  config: ResolvedRepoConfig,
  call: ToolCall
): ToolExecutionOutcome {
  Logger.tool(`${call.name}(${JSON.stringify(call.arguments)})`);

  switch (call.name) {
    case TOOL_NAMES.LIST_PAGE_OBJECTS:
      return { result: { toolCallId: call.id, name: call.name, content: JSON.stringify(listPageObjects(config), null, 2) } };

    case TOOL_NAMES.GET_PAGE_OBJECT_SOURCE:
      return {
        result: {
          toolCallId: call.id,
          name: call.name,
          content: getPageObjectSource(config, String(call.arguments.pageObjectName))
        }
      };

    case TOOL_NAMES.GET_FIXTURE_SOURCE:
      return { result: { toolCallId: call.id, name: call.name, content: getFixtureSource(config) } };

    case TOOL_NAMES.GET_TEST_DATA_UTIL_SOURCE:
      return { result: { toolCallId: call.id, name: call.name, content: getTestDataUtilSource(config) } };

    case TOOL_NAMES.WRITE_TEST_FILE: {
      const outcome = writeTestFile(config, String(call.arguments.fileName), String(call.arguments.testCode));
      Logger.success(`Test script written to ${outcome.relativePath}`);
      return {
        result: {
          toolCallId: call.id,
          name: call.name,
          content: JSON.stringify({ relativePath: outcome.relativePath, status: 'written' })
        },
        terminal: { filePath: outcome.relativePath, code: outcome.testCode }
      };
    }

    default:
      return { result: { toolCallId: call.id, name: call.name, content: `ERROR: Unknown tool "${call.name}".` } };
  }
}
