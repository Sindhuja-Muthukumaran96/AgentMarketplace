import { execFile } from 'node:child_process';

export interface RawCommandResult {
  rawOutput: string;
  durationMs: number;
}

/**
 * Runs an arbitrary shell command (built by the plugin from its configured
 * `testCommand` template) and captures stdout. Framework-agnostic: this module
 * has no knowledge of Playwright, Cypress, Jest, etc. — interpreting the output
 * is the calling plugin's responsibility (see each plugin's own result parser).
 */
export async function runCommand(cwd: string, command: string, args: string[]): Promise<RawCommandResult> {
  const startedAt = Date.now();

  const rawOutput = await new Promise<string>((resolve) => {
    execFile(command, args, { cwd, maxBuffer: 1024 * 1024 * 50, shell: true }, (_error, stdout) => {
      // Many test runners exit non-zero on failure; stdout still contains the
      // structured report we need, so we intentionally ignore the exit code here.
      resolve(stdout);
    });
  });

  return { rawOutput, durationMs: Date.now() - startedAt };
}

/** Splits a `testCommand` template like "npx playwright test {file} --reporter=json" into command + args */
export function buildCommandArgs(template: string, replacements: Record<string, string>): { command: string; args: string[] } {
  let resolved = template;
  for (const [key, value] of Object.entries(replacements)) {
    resolved = resolved.split(`{${key}}`).join(value);
  }
  const parts = resolved.split(' ').filter(Boolean);
  const [command, ...args] = parts;
  return { command, args };
}
