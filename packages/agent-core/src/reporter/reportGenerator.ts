import path from 'node:path';
import type { AgentRunRecord, GenerationAttempt } from '../types';
import { writeFile, slugify } from '../utils/fileUtils';
import { Logger } from '../utils/logger';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdownToolTrace(attempt: GenerationAttempt): string {
  if (attempt.toolTrace.length === 0) return '_No tool calls recorded._';
  return attempt.toolTrace
    .map((trace, i) => {
      const argsJson = JSON.stringify(trace.call.arguments);
      const preview = trace.result.content.length > 300 ? `${trace.result.content.slice(0, 300)}...` : trace.result.content;
      return `${i + 1}. **${trace.call.name}**(${argsJson})\n   \u21b3 ${preview.replace(/\n/g, '\n   ')}`;
    })
    .join('\n');
}

function renderMarkdownAttempt(attempt: GenerationAttempt): string {
  const execution = attempt.execution;
  const executionSection = execution
    ? `- **Result:** ${execution.passed ? '✅ PASSED' : '❌ FAILED'}\n` +
      `- **Checks:** ${execution.passedChecks}/${execution.totalChecks} passed\n` +
      `- **Duration:** ${(execution.durationMs / 1000).toFixed(1)}s\n` +
      (execution.failureMessages.length > 0 ? `\n**Failure details:**\n\`\`\`\n${execution.failureMessages.join('\n\n')}\n\`\`\`\n` : '')
    : '_Execution not reached (generation failed before a file was written)._';

  return `### Attempt ${attempt.attemptNumber}

**Tool calls:**

${renderMarkdownToolTrace(attempt)}

**Generated file:** \`${attempt.generatedFilePath ?? 'n/a'}\`

<details>
<summary>View generated code</summary>

\`\`\`typescript
${attempt.generatedCode ?? '// no code produced this attempt'}
\`\`\`

</details>

**Execution:**

${executionSection}
`;
}

function renderMarkdownRag(record: AgentRunRecord): string {
  const rows = record.retrieval.chunks
    .map((chunk, i) => `| ${i + 1} | ${chunk.source} | ${chunk.heading ?? '-'} | ${chunk.score.toFixed(3)} |`)
    .join('\n');
  return `**Query embedded for similarity search:**\n\n> ${record.retrieval.query.replace(/\n/g, '\n> ')}\n\n` +
    `Top ${record.retrieval.chunks.length} most relevant chunks retrieved and injected as grounding context:\n\n` +
    `| # | Source | Section | Relevance Score |\n|---|--------|---------|------------------|\n${rows}\n`;
}

function renderHtmlToolTrace(attempt: GenerationAttempt): string {
  if (attempt.toolTrace.length === 0) return '<p class="muted">No tool calls recorded.</p>';
  return `<ol class="tool-trace">${attempt.toolTrace
    .map((trace) => {
      const argsJson = escapeHtml(JSON.stringify(trace.call.arguments));
      const preview = trace.result.content.length > 400 ? `${trace.result.content.slice(0, 400)}...` : trace.result.content;
      return `<li><code class="tool-name">${escapeHtml(trace.call.name)}</code>(${argsJson})<pre class="tool-result">${escapeHtml(preview)}</pre></li>`;
    })
    .join('')}</ol>`;
}

function renderHtmlAttempt(attempt: GenerationAttempt): string {
  const execution = attempt.execution;
  const statusBadge = execution
    ? execution.passed ? '<span class="badge pass">PASSED</span>' : '<span class="badge fail">FAILED</span>'
    : '<span class="badge na">NOT EXECUTED</span>';
  const executionHtml = execution
    ? `<p><b>Checks:</b> ${execution.passedChecks}/${execution.totalChecks} passed &middot; <b>Duration:</b> ${(execution.durationMs / 1000).toFixed(1)}s</p>` +
      (execution.failureMessages.length > 0 ? `<pre class="failure">${escapeHtml(execution.failureMessages.join('\n\n'))}</pre>` : '')
    : '<p class="muted">Generation failed before a file was written this attempt.</p>';

  return `<div class="attempt-card">
    <div class="attempt-header"><h3>Attempt ${attempt.attemptNumber}</h3>${statusBadge}</div>
    <h4>Tool Calls</h4>
    ${renderHtmlToolTrace(attempt)}
    <p><b>Generated file:</b> <code>${escapeHtml(attempt.generatedFilePath ?? 'n/a')}</code></p>
    <details><summary>View generated code</summary><pre class="code"><code>${escapeHtml(attempt.generatedCode ?? '// no code produced this attempt')}</code></pre></details>
    <h4>Execution</h4>
    ${executionHtml}
  </div>`;
}

function renderHtmlReport(record: AgentRunRecord): string {
  const statusBadge = record.success ? '<span class="badge pass large">SUCCESS</span>' : '<span class="badge fail large">FAILED</span>';
  const ragRows = record.retrieval.chunks
    .map((chunk, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(chunk.source)}</td><td>${escapeHtml(chunk.heading ?? '-')}</td><td>${chunk.score.toFixed(3)}</td></tr>`)
    .join('');
  const attemptsHtml = record.attempts.map(renderHtmlAttempt).join('');
  const outcomeHtml = record.success
    ? `The generated artifact <b>passed</b> after ${record.attempts.length} attempt(s) and is available at <code>${escapeHtml(record.finalFilePath ?? 'n/a')}</code>.`
    : `The agent could <b>not</b> produce a passing result within ${record.attempts.length} attempt(s). Review the failure details above.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Agent Run Report — ${escapeHtml(record.runId)}</title>
<style>
  :root { --navy:#0f2742; --blue:#1f6feb; --blue-light:#e8f1ff; --green:#1a7f4e; --green-light:#e6f7ee;
    --red:#b42318; --red-light:#fdecea; --gray:#5b6b7b; --border:#e2e8f0; --bg:#f5f7fa; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:#1b2733; line-height:1.55; }
  header { background:linear-gradient(135deg,var(--navy),var(--blue)); color:#fff; padding:32px; }
  header h1 { margin:0 0 6px; font-size:1.6rem; }
  header .meta { opacity:0.9; font-size:0.9rem; }
  main { max-width:1000px; margin:0 auto; padding:24px; }
  section.panel { background:#fff; border:1px solid var(--border); border-radius:12px; padding:24px; margin-bottom:20px; box-shadow:0 1px 3px rgba(16,24,40,0.06); }
  h2 { margin-top:0; color:var(--navy); font-size:1.2rem; }
  table { width:100%; border-collapse:collapse; font-size:0.9rem; }
  th { background:var(--navy); color:#fff; text-align:left; padding:8px 10px; }
  td { padding:8px 10px; border-bottom:1px solid var(--border); }
  tr:nth-child(even) td { background:#fafcff; }
  pre { background:#0f172a; color:#e2e8f0; padding:14px; border-radius:8px; overflow-x:auto; font-size:0.82rem; }
  pre.failure { background:var(--red-light); color:var(--red); }
  pre.tool-result { background:#f1f5f9; color:#334155; max-height:200px; }
  code.tool-name { color:var(--blue); font-weight:600; }
  .badge { display:inline-block; padding:4px 12px; border-radius:999px; font-weight:700; font-size:0.78rem; }
  .badge.pass { background:var(--green-light); color:var(--green); }
  .badge.fail { background:var(--red-light); color:var(--red); }
  .badge.na { background:#eef1f4; color:var(--gray); }
  .badge.large { font-size:0.95rem; padding:6px 16px; }
  .muted { color:var(--gray); }
  .attempt-card { border:1px solid var(--border); border-radius:10px; padding:16px; margin-bottom:16px; background:#fafcff; }
  .attempt-header { display:flex; align-items:center; gap:12px; }
  .attempt-header h3 { margin:0; }
  .tool-trace { padding-left:20px; }
  .tool-trace li { margin-bottom:10px; }
  blockquote { border-left:4px solid var(--blue); margin:0; padding:4px 0 4px 14px; color:var(--gray); }
</style>
</head>
<body>
<header>
  <h1>Agent Run Report</h1>
  <div class="meta">
    Run ID: ${escapeHtml(record.runId)} &middot; Started: ${escapeHtml(record.startedAt)} &middot; Finished: ${escapeHtml(record.finishedAt)}<br>
    ${statusBadge} &middot; Attempts: ${record.attempts.length} &middot; Final file: <code>${escapeHtml(record.finalFilePath ?? 'n/a')}</code>
  </div>
</header>
<main>
  <section class="panel"><h2>1. Input</h2><pre>${escapeHtml(record.input)}</pre></section>
  <section class="panel">
    <h2>2. RAG Retrieval</h2>
    <p class="muted">Query embedded for similarity search:</p>
    <blockquote>${escapeHtml(record.retrieval.query)}</blockquote>
    <p>Top ${record.retrieval.chunks.length} most relevant chunks retrieved and injected as grounding context:</p>
    <table><thead><tr><th>#</th><th>Source</th><th>Section</th><th>Relevance Score</th></tr></thead><tbody>${ragRows}</tbody></table>
  </section>
  <section class="panel"><h2>3. Generation &amp; Execution Attempts</h2>${attemptsHtml}</section>
  <section class="panel"><h2>4. Final Outcome</h2><p>${outcomeHtml}</p></section>
</main>
</body>
</html>
`;
}

/**
 * Generic report generator shared by every plugin: writes `.md`, `.json`, and
 * `.html` reports for a single agent run into `reportsDir`.
 */
export function generateReport(record: AgentRunRecord, reportsDir: string): { markdownPath: string; jsonPath: string; htmlPath: string } {
  const slug = slugify(record.input.split('\n')[0]);
  const base = `${record.runId}-${slug}`;

  const attemptsMarkdown = record.attempts.map(renderMarkdownAttempt).join('\n---\n\n');

  const markdown = `# Agent Run Report

- **Run ID:** ${record.runId}
- **Started:** ${record.startedAt}
- **Finished:** ${record.finishedAt}
- **Final status:** ${record.success ? '✅ SUCCESS' : '❌ FAILED (max retries exhausted)'}
- **Total attempts:** ${record.attempts.length}
- **Final file:** \`${record.finalFilePath ?? 'n/a'}\`

## 1. Input

\`\`\`
${record.input}
\`\`\`

## 2. RAG Retrieval

${renderMarkdownRag(record)}

## 3. Generation & Execution Attempts (Generate → Execute → Retry loop)

${attemptsMarkdown}

## 4. Final Outcome

${
  record.success
    ? `The generated artifact **passed** after ${record.attempts.length} attempt(s) and is available at \`${record.finalFilePath}\`.`
    : `The agent could **not** produce a passing result within ${record.attempts.length} attempt(s). Review the failure details above.`
}
`;

  const markdownPath = path.join(reportsDir, `${base}.md`);
  const jsonPath = path.join(reportsDir, `${base}.json`);
  const htmlPath = path.join(reportsDir, `${base}.html`);

  writeFile(markdownPath, markdown);
  writeFile(jsonPath, JSON.stringify(record, null, 2));
  writeFile(htmlPath, renderHtmlReport(record));

  Logger.success(`Report written to ${markdownPath}`);
  Logger.success(`HTML report written to ${htmlPath}`);

  return { markdownPath, jsonPath, htmlPath };
}
