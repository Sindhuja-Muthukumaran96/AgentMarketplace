import type { ExecutionResult } from '@agent-marketplace/agent-core';
import { Logger } from '@agent-marketplace/agent-core';

interface PlaywrightJsonResult {
  stats: { expected: number; unexpected: number; flaky: number; skipped: number; duration: number };
  suites: PlaywrightJsonSuite[];
}

interface PlaywrightJsonSuite {
  suites?: PlaywrightJsonSuite[];
  specs?: Array<{
    title: string;
    tests: Array<{ results: Array<{ status: string; error?: { message?: string } }> }>;
  }>;
}

function collectFailureMessages(suites: PlaywrightJsonSuite[] = []): string[] {
  const messages: string[] = [];
  for (const suite of suites) {
    for (const spec of suite.specs || []) {
      for (const specTest of spec.tests) {
        for (const result of specTest.results) {
          if (result.status !== 'passed' && result.error?.message) {
            messages.push(`[${spec.title}] ${result.error.message}`);
          }
        }
      }
    }
    if (suite.suites) messages.push(...collectFailureMessages(suite.suites));
  }
  return messages;
}

/** Parses `npx playwright test --reporter=json` stdout into a generic ExecutionResult */
export function parsePlaywrightJsonResult(rawOutput: string, durationMs: number): ExecutionResult {
  let parsed: PlaywrightJsonResult | null = null;
  try {
    parsed = JSON.parse(rawOutput) as PlaywrightJsonResult;
  } catch {
    Logger.error('Could not parse Playwright JSON reporter output.');
  }

  if (!parsed) {
    return {
      passed: false,
      durationMs,
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      rawOutput,
      failureMessages: [`Playwright did not produce a parsable JSON report. Raw output:\n${rawOutput.slice(0, 2000)}`]
    };
  }

  const passedChecks = parsed.stats.expected;
  const failedChecks = parsed.stats.unexpected;
  const totalChecks = passedChecks + failedChecks + parsed.stats.skipped;

  return {
    passed: failedChecks === 0 && totalChecks > 0,
    durationMs,
    totalChecks,
    passedChecks,
    failedChecks,
    rawOutput,
    failureMessages: collectFailureMessages(parsed.suites)
  };
}
