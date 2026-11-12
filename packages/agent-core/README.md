# @agent-marketplace/agent-core

Shared engine for every agent-marketplace plugin. Framework-agnostic — has no
knowledge of Playwright, Cypress, or any specific repository's folder layout.

## What it provides

| Module | Purpose |
|---|---|
| `config/configLoader` | Resolves a target repo's conventions (auto-detect + `agent.config.json` + overrides) |
| `rag/*` | Document loading, chunking, embeddings (local hash or OpenAI), vector store, retriever |
| `llm/*` | Generic chat message types, OpenAI tool-calling provider, prompt-building helpers |
| `tools/toolRuntime` | Generic LLM tool-calling loop (list/inspect/produce-terminal-result pattern) |
| `executor/commandExecutor` | Generic shell command runner + command-template builder |
| `reporter/reportGenerator` | Generic Markdown + HTML + JSON run report writer |
| `utils/*` | Logger, file helpers |

Plugins (e.g. [`test-script-design-agent`](../test-script-design-agent)) depend
on this package and supply only what's specific to their job: tool
definitions, prompt wording, a result parser for whatever command they run,
and a bundled default knowledge base.

## Build

```powershell
npm run build --workspace=@agent-marketplace/agent-core
```
