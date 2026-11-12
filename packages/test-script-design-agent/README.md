# Test Script Design Agent

`@agent-marketplace/test-script-design-agent` — a RAG-grounded, tool-calling
agent that turns a plain-English acceptance criterion into a passing
Playwright + TypeScript test script, **in any repository** that follows (or
configures) a Page Object Model layout.

Built on [`@agent-marketplace/agent-core`](../agent-core) for RAG retrieval,
LLM tool-calling, command execution, and report generation.

## The 5-step flow

1. **Input** — an acceptance criterion, via `--ac-file` or `--ac-text`.
2. **RAG retrieval** — the criterion is matched against this plugin's bundled
   default knowledge base **and** the target repo's own live Page
   Objects/fixtures/test-data utility (and any extra `knowledgeBaseDirs` it
   configures), returning the top-K most relevant chunks.
3. **LLM + tools generate the script** — the model must call tools
   (`list_page_objects`, `get_page_object_source`, `get_fixture_source`,
   `get_test_data_util_source`) to ground itself in the target repo's real
   code, then call `write_test_file` — the only way it can deliver a result.
4. **Execution gate with retries** — the configured test command is run for
   real against the generated file. A failure's exact error message is fed
   back to the LLM, which must produce a corrected file, up to
   `AGENT_MAX_RETRIES` (default 3) times.
5. **Report** — a Markdown + HTML + JSON report is written to
   `<target-repo>/agent-reports/`.

See the root [monorepo README](../../README.md) and
[`docs/PLUGIN_CONFIG.md`](../../docs/PLUGIN_CONFIG.md) for the shared
architecture and configuration mechanism.

## Install & build

```powershell
# From the agent-marketplace repo root
npm install
npm run build --workspace=@agent-marketplace/agent-core
npm run build --workspace=@agent-marketplace/test-script-design-agent
```

## Usage

```powershell
# Offline demo mode (no API key required) against any repo on disk
node packages/test-script-design-agent/dist/cli.js run `
  --ac-file path/to/acceptance-criteria.md `
  --target-repo ../your-repo `
  --headed

# Once published, the same thing via the installed CLI:
npx test-script-design-agent run --ac-text "..." --target-repo ../your-repo
```

CLI flags: `--ac-file`, `--ac-text`, `--target-repo`, `--max-retries`,
`--llm-provider`, `--test-command`, `--headed`. Full reference in
[`docs/PLUGIN_CONFIG.md`](../../docs/PLUGIN_CONFIG.md).

## Switching from the offline Mock to a real LLM

```powershell
$env:AGENT_LLM_PROVIDER = "openai"
$env:AGENT_EMBEDDING_PROVIDER = "openai"
$env:OPENAI_API_KEY = "sk-..."
```

No other changes needed — `agent-core` swaps in the real provider behind the
same `LlmProvider`/`EmbeddingProvider` interfaces.

> **About the bundled Mock provider:** it is a deterministic, offline stand-in
> calibrated against a specific sample Page Object API shape (see
> `src/llm/mockScenarios.ts`) so the full flow — including the self-healing
> retry loop — can be demoed with zero API keys. It recognizes a handful of
> acceptance-criteria keyword patterns. **For a genuinely new/arbitrary
> repository, use `--llm-provider openai`**, which reasons generically via the
> same tool-calling protocol regardless of that repo's Page Object shapes.

## What ends up in the target repository

- `<target-repo>/<generatedTestsSubDir>/<slug>.spec.ts` — the generated test.
- `<target-repo>/agent-reports/<run-id>-<slug>.{md,html,json}` — the run report.
- `<target-repo>/.agent-cache/test-script-design-agent-vector-index.json` — a
  content-hashed cache of the RAG index (safe to delete; speeds up repeat runs).

Add `.agent-cache/` and `agent-reports/` to the target repo's `.gitignore` (or
commit `agent-reports/` if you want generated runs tracked in history).
