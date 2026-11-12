# Agent Marketplace

A **VS Code Agent Plugin** that brings pluggable AI agents for software testing directly into your Copilot Chat. Each agent is built on a shared engine (`@agent-marketplace/agent-core`), so it can work with **any** target repository — no hardcoded paths or assumptions.

## Installation

### Via VS Code (Recommended)

1. Open VS Code and run **Chat: Open Customizations** from the Command Palette.
2. Open **Plugins**, then select **+** next to **User** or **Workspace**.
3. Choose **Install Plugin from Source**.
4. Enter the repository URL and confirm:
   ```
   https://github.com/xxxxx/testautomation
   ```
5. Start a new Copilot chat and select **ACE Quality Engineer** (or any installed agent).
6. Type a request like: `Generate a test for: Users can log in with valid credentials`

### From Marketplace (when published)

1. Open **Extensions** in VS Code.
2. Search for **Agent Marketplace** or **ACE Quality Engineer**.
3. Select **Install**.
4. Open **Chat: Open Customizations**, confirm the plugin is enabled.
5. Start a new Copilot chat and begin using the agents.

## What's included

```
agent-marketplace/                     (this repo)
├── plugin.json                        VS Code Agent Plugins 1.0 metadata
├── skills/                            Agent capabilities (discovered by VS Code)
│   └── test-script-design/
│       └── SKILL.md                   Test generation skill documentation
├── packages/
│   ├── agent-core/                    Shared engine: RAG, LLM, tools, execution, reporting
│   └── test-script-design-agent/      CLI interface (also usable standalone)
├── apps/
│   └── marketplace-web/               Optional: local web catalog UI
└── docs/
    ├── PLUGIN_CONFIG.md               How repository auto-detection works
    └── PLUGIN_MIGRATION_PLAN.md       Architecture and roadmap
```

## Why a shared core?

Every agent needs:
- RAG (Retrieval-Augmented Generation) to ground context
- LLM provider abstraction (mock, OpenAI, etc.)
- Tool calling and execution
- Real test validation + automatic retry
- Report generation

`agent-core` implements this **once**, so each agent only provides:
- Tool definitions (what it can do)
- System prompt (what it should do)
- Result parser (how to interpret outcomes)
- Bundled knowledge base (domain standards)

This design lets you add new agents without rebuilding the core machinery.

## Using the agents

### In Copilot Chat

After installation, type `@test-script-design` in a new Copilot Chat:

```
@test-script-design
Generate a test for this acceptance criterion:
Users can log in with valid email and password, then see the dashboard.
```

The agent will:
1. Auto-discover your repository's Page Objects, fixtures, and test standards
2. Use RAG to find similar tests in your repo
3. Generate a complete Playwright + TypeScript test
4. Run it against your test infrastructure
5. Auto-fix any failures (up to 3 retries)
6. Produce an HTML/JSON report

### From Command Line (advanced)

```powershell
# Run the agent's CLI directly (useful for CI/CD)
npx test-script-design-agent run `
  --ac-text "Users can log in with valid credentials" `
  --target-repo ../my-repo
```

See [`packages/test-script-design-agent/README.md`](./packages/test-script-design-agent/README.md) for CLI details.

## Repository configuration

The agent auto-detects common test folder structures:
- Page Objects: `src/pages`, `pages`, `page-objects`
- Fixtures: `src/fixtures`, `fixtures`
- Test utilities: `src/utils`, `utils`
- Tests: `tests`, `test`, `e2e`, `playwright-tests`

To override defaults, create `agent.config.json` at your repo root:

```json
{
  "pageObjectsDir": "src/pages",
  "fixturesDir": "src/fixtures",
  "testCommand": "npx playwright test {file}",
  "knowledgeBaseDirs": ["docs/testing-standards"]
}
```

See [`docs/PLUGIN_CONFIG.md`](./docs/PLUGIN_CONFIG.md) for all options.

## Project structure

### For users

- **plugin.json** — Defines the VS Code Agent Plugin and available skills
- **skills/** — Each skill (agent capability) has a `SKILL.md` explaining its purpose and usage
- **README.md** — Installation and basic usage

### For developers

- **packages/agent-core/** — Shared engine (RAG, LLM providers, tool execution)
- **packages/test-script-design-agent/** — Test generation agent (CLI + core logic)
- **docs/PLUGIN_CONFIG.md** — Repository configuration and auto-detection
- **PLUGIN_MIGRATION_PLAN.md** — Architecture decisions and future roadmap

## Quick start (development)

```powershell
npm install
npm run build          # Compile all packages
npm run type-check     # Verify TypeScript

# Optional: run a local test against a sample repo
cd packages/test-script-design-agent
npm run dev -- --ac-text "Users can log in" --target-repo ../sample-repo
```

## Adding a new agent

1. Create a skill directory: `skills/<agent-name>/SKILL.md`
2. Add the agent to `plugin.json` under `agents` and `skills`
3. Implement the agent logic in `packages/<agent-name>/`
4. Reuse `agent-core` building blocks

See [PLUGIN_MIGRATION_PLAN.md](./PLUGIN_MIGRATION_PLAN.md) for details.

## What gets generated in your repository

When you run the agent, it creates:

- **Test file**: `<target-repo>/<testsDir>/generated/<name>.spec.ts`
- **Reports**: `<target-repo>/agent-reports/<run-id>.{html,json}`
- **Cache**: `<target-repo>/.agent-cache/` (safe to delete; speeds up re-runs)

Add these to `.gitignore`:
```
agent-reports/
.agent-cache/
```

## Repository

This is a **separate repository** from any target automation project. Agents here are installed *into* a target repo's workflow, never embedded. This keeps them reusable across any codebase.

## License

MIT
