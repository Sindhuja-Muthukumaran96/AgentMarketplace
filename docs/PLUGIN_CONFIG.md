# Plugin Configuration (`agent.config.json`)

Every plugin resolves a target repository's conventions the same way, via
`loadRepoConfig()` in `@agent-marketplace/agent-core`, layering three sources
in increasing priority:

## 1. Auto-detection (works out of the box)

If no config file is present, common folder names are detected automatically:

| Setting | Candidates checked (first match wins) |
|---|---|
| `pageObjectsDir` | `src/pages`, `pages`, `src/page-objects`, `page-objects`, `src/pom` |
| `fixturesDir` | `src/fixtures`, `fixtures`, `test/fixtures`, `tests/fixtures` |
| `utilsDir` | `src/utils`, `utils`, `src/helpers`, `helpers` |
| `testsDir` | `tests`, `test`, `e2e`, `cypress/e2e`, `playwright-tests` |

`generatedTestsSubDir` defaults to `<testsDir>/ui/generated` if not overridden.

## 2. `agent.config.json` (explicit override)

Place a JSON file at the root of the target repository to override any of the
auto-detected values, or to set a repo-specific `testCommand`:

```json
{
  "pageObjectsDir": "src/pages",
  "fixturesDir": "src/fixtures",
  "utilsDir": "src/utils",
  "testsDir": "tests",
  "generatedTestsSubDir": "tests/ui/generated",
  "knowledgeBaseDirs": ["docs/testing-standards"],
  "testCommand": "npx playwright test {file} --project=chromium --reporter=json"
}
```

All paths are relative to the repository root. `knowledgeBaseDirs` lets a repo
contribute its *own* markdown standards docs into the RAG corpus alongside the
plugin's bundled defaults.

`{file}` in `testCommand` is replaced with the path (forward-slash normalized)
of the file the plugin just generated.

## 3. CLI flags / environment variables (per-run override)

The highest-priority layer, for a single invocation:

| CLI flag | Env var equivalent | Purpose |
|---|---|---|
| `--target-repo <path>` | — | Which repository to operate on (defaults to cwd) |
| `--max-retries <n>` | `AGENT_MAX_RETRIES` | Generate/execute/retry attempt budget |
| `--llm-provider <mock\|openai>` | `AGENT_LLM_PROVIDER` | Which reasoning backend to use |
| `--test-command <template>` | `AGENT_TEST_COMMAND` | Override the test command template |
| `--headed` | `AGENT_HEADED=true` | Run the generated test with a visible browser |
| — | `AGENT_EMBEDDING_PROVIDER` | `local` (offline) or `openai` (real embeddings) |
| — | `OPENAI_API_KEY` | Required when either provider above is `openai` |

## Why layer it this way?

Most repositories that already follow a conventional Page Object Model layout
need **zero configuration** — auto-detection just works. `agent.config.json`
exists for the repositories that don't follow the common names, without
forcing every consumer to write one. CLI flags exist so a single demo/CI run
can override behavior without touching the target repo at all.
