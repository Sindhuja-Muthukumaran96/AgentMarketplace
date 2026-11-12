# Agent Marketplace Architecture

This document describes the plugin architecture and how agents are organized, discovered, and executed.

## Overview

The Agent Marketplace is a **VS Code Agent Plugin** (Agent Plugins 1.0) that provides pluggable AI agents for testing. Unlike traditional extensions, it:

- Installs from Git source directly into VS Code
- Integrates with Copilot Chat via Chat Participants (`@agent-name`)
- Works with **any** target repository (no hardcoded paths)
- Shares a common execution engine across all agents
- Stays in your target repo (all output goes there, not to the plugin folder)

## Directory Structure

```
agent-marketplace/
├── plugin.json                         # Agent Plugins 1.0 metadata
├── package.json                        # VS Code extension + workspaces config
├── README.md                           # Main documentation
├── skills/                             # Agent capabilities (discoverable by VS Code)
│   └── test-script-design/
│       └── SKILL.md                    # Skill definition & documentation
├── packages/                           # Shared and plugin packages
│   ├── agent-core/                     # Shared execution engine
│   │   ├── src/
│   │   │   ├── llm/                    # LLM provider abstraction
│   │   │   ├── rag/                    # Retriever & vector search
│   │   │   ├── tools/                  # Tool execution runtime
│   │   │   ├── command/                # Test command executor
│   │   │   └── report/                 # Report generation
│   │   └── package.json
│   └── test-script-design-agent/       # Test generation agent
│       ├── src/
│       │   ├── orchestrator.ts         # Core control loop
│       │   ├── tools/                  # Agent-specific tool definitions
│       │   ├── llm/prompts.ts          # System prompt & instructions
│       │   ├── executor/               # Test result parsing
│       │   └── cli.ts                  # CLI entry point
│       ├── knowledge-base/             # Bundled standards documentation
│       │   ├── 01-page-object-standards.md
│       │   └── ... (standards docs)
│       └── package.json
├── apps/
│   └── marketplace-web/                # Optional: local web UI
└── docs/
    ├── PLUGIN_CONFIG.md                # Repository configuration
    ├── ARCHITECTURE.md                 # This file
    ├── INSTALLATION.md                 # Installation guide
    └── PLUGIN_MIGRATION_PLAN.md        # Design decisions & roadmap
```

## How It Works

### 1. Plugin Discovery & Activation

When you install the Agent Marketplace plugin from Git:

1. **VS Code loads `plugin.json`**
   - Registers the plugin metadata (name, version, description)
   - Discovers available agents and skills

2. **Skills are indexed**
   - VS Code scans `skills/` directory
   - Each `SKILL.md` file defines a capability
   - Skills become available in Copilot Chat

3. **Chat Participants are registered** (future: via extension.ts)
   - When you type `@agent-name` in Copilot Chat
   - VS Code routes the message to the agent's handler

### 2. User Interaction in Copilot Chat

```
User: "@test-script-design Generate a test for: Users can log in"
  ↓
VS Code Chat Participant routes message to agent
  ↓
Agent receives message + workspace context
  ↓
Agent processes the request
  ↓
Response streams back to Copilot Chat
  ↓
User sees test code + report link
```

### 3. Agent Execution (Test Script Design Example)

The agent follows a **5-step flow**:

```
┌─────────────────────────────────────────────────┐
│ 1. INPUT: Acceptance Criterion                   │
│    (from user in Copilot Chat)                   │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. RAG RETRIEVAL                                │
│    - Load target repo's config (auto-detect)     │
│    - Discover Page Objects, fixtures, tests      │
│    - Query vector index for relevant context     │
│    - Combine with bundled knowledge base        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. GENERATION (LLM + Tools)                      │
│    - LLM reads criterion + retrieved context     │
│    - Calls tools:                                │
│      • list_page_objects                        │
│      • get_page_object_source                   │
│      • get_fixture_source                       │
│      • write_test_file                          │
│    - Generates complete test script             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. EXECUTION + RETRY                             │
│    - Run test: npm playwright test <file>       │
│    - If fails: feed error back to LLM            │
│    - LLM fixes issue                            │
│    - Retry up to 3 times                        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. REPORTING                                    │
│    - Generate HTML + JSON report                 │
│    - Include test code, results, logs           │
│    - Save to target repo's agent-reports/       │
└─────────────────────────────────────────────────┘
```

### 4. Repository Configuration & Auto-detection

The agent discovers target repo structure automatically:

**Auto-detected paths:**
```
Page Objects:  src/pages → pages → page-objects
Fixtures:      src/fixtures → fixtures
Utils:         src/utils → utils
Tests:         tests → test → e2e
```

**Override with `agent.config.json`:**
```json
{
  "pageObjectsDir": "src/pages",
  "fixturesDir": "src/fixtures",
  "testCommand": "npx playwright test {file}"
}
```

### 5. Knowledge Base (Bundled + Repository-Specific)

The agent grounds its generation in **two sources**:

1. **Bundled Knowledge Base** (in plugin)
   - Playwright best practices
   - Page Object patterns
   - Assertion strategies
   - Located: `packages/test-script-design-agent/knowledge-base/`

2. **Repository Knowledge** (auto-discovered)
   - Actual Page Objects in target repo
   - Existing test examples
   - Repository-specific documentation
   - Configured via `knowledgeBaseDirs` in `agent.config.json`

**Example retrieval:**
```
Query: "login test with email and password"
   ↓
Vector search ranks candidates:
  1. Bundled: "Page Object patterns" (score: 0.82)
  2. Repo: "LoginPage.ts" (score: 0.91) ← highest
  3. Bundled: "Best practices for auth" (score: 0.78)
   ↓
LLM receives top-K results + criterion
```

## Component Responsibilities

### `plugin.json`
- **Responsibility**: Declare plugin to VS Code
- **Content**: Plugin metadata, agent list, skills locations
- **Loaded by**: VS Code's plugin system on startup

### `skills/<skill-name>/SKILL.md`
- **Responsibility**: Document agent capability for users
- **Content**: Purpose, when to use, examples, configuration
- **Shown in**: Copilot Chat help + plugin documentation

### `agent-core`
- **Responsibility**: Shared execution engine
- **Provides**:
  - `Retriever` — RAG vector search
  - `LlmProvider` — LLM abstraction (mock, OpenAI, etc.)
  - `runToolLoop` — Tool calling orchestration
  - `runCommand` — Test execution
  - `generateReport` — Report generation
  - `loadRepoConfig` — Repository auto-detection

### Test Script Design Agent
- **Responsibility**: Generate Playwright tests
- **Provides**:
  - Tool definitions (list_page_objects, write_test_file, etc.)
  - System prompt (what the LLM should do)
  - Result parser (interpret test execution)
  - Bundled knowledge base
- **Entry points**:
  - CLI: `dist/cli.js` (for command-line usage)
  - Core: `dist/index.ts` (for Chat Participant integration)

## Data Flow: Detailed Example

**User types in Copilot Chat:**
```
@test-script-design
Generate a test for: Users can add items to the shopping cart
```

**Flow:**

1. **Message routing** (VS Code)
   - Recognizes `@test-script-design`
   - Routes to Test Script Design agent handler

2. **Agent receives context**
   ```typescript
   {
     message: "Generate a test for: Users can add items...",
     workspaceRoot: "/path/to/my-repo",
     targetRepo: "/path/to/my-repo"
   }
   ```

3. **Agent loads config**
   - Reads `agent.config.json` if present
   - Falls back to auto-detection
   - Discovers `src/pages/`, `src/fixtures/`, etc.

4. **RAG retrieval**
   - Loads all `.ts` files from `src/pages/`, fixtures
   - Loads bundled knowledge base (8 markdown files)
   - Vectorizes both sources
   - Searches for "shopping cart" + "add items"
   - Returns top-5 chunks (e.g., `ShoppingCartPage.ts`, existing tests)

5. **LLM generation**
   ```
   SYSTEM PROMPT: "You are an expert test automation engineer..."
   
   USER MESSAGE: 
   "Criterion: Users can add items to the shopping cart
    
    Retrieved context:
    - ShoppingCartPage.ts: [source code]
    - ExistingCheckoutTest.spec.ts: [source code]
    - Best practices: [knowledge base]"
   
   LLM RESPONSE:
   Calls tool: list_page_objects
   Calls tool: get_page_object_source(ShoppingCartPage)
   Calls tool: get_page_object_source(ProductPage)
   Calls tool: write_test_file({path, code})
   ```

6. **Test execution**
   - Writes test to `tests/generated/add-items-to-cart.spec.ts`
   - Runs: `npx playwright test tests/generated/add-items-to-cart.spec.ts`
   - Gets output: ✅ PASS or ❌ FAIL + error message

7. **Retry loop** (if failed)
   ```
   LLM sees error: "Timeout waiting for product selector"
   LLM corrects: Updates selector in test
   LLM calls: write_test_file({path, code: fixed})
   Run test again → ✅ PASS
   ```

8. **Report generation**
   - Creates `agent-reports/add-items-to-cart-001.html`
   - Includes:
     - User's original criterion
     - Generated test code
     - Execution logs
     - Retry history
     - Pass/fail result

9. **Response to user**
   ```
   ✅ Test generated and passed!
   
   Test file: tests/generated/add-items-to-cart.spec.ts
   Report: agent-reports/add-items-to-cart-001.html
   
   [Generated test code snippet displayed in chat]
   ```

## Extension Points (For Adding New Agents)

To add a new agent to the marketplace:

1. **Create a skill**:
   ```
   skills/<new-agent>/SKILL.md
   ```

2. **Register in plugin.json**:
   ```json
   {
     "agents": [
       {
         "id": "new-agent",
         "name": "New Agent Name",
         "description": "..."
       }
     ],
     "skills": [
       {
         "id": "new-agent",
         "path": "skills/new-agent/SKILL.md"
       }
     ]
   }
   ```

3. **Implement agent package**:
   ```
   packages/<new-agent>/
   ├── src/
   │   ├── orchestrator.ts (reuse agent-core building blocks)
   │   ├── tools/
   │   ├── llm/prompts.ts
   │   └── cli.ts
   └── knowledge-base/
   ```

4. **Register Chat Participant** (future: in extension.ts)

See [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) for detailed roadmap.

## Security & Isolation

- **No network calls** beyond configured LLM provider (OpenAI, mock, etc.)
- **Sandboxed tool execution** — tools can only:
  - Read files in target repo
  - Write to target repo's `generated/` subdirectory and `agent-reports/`
  - Run the configured test command
- **No access to VS Code secrets** without explicit permission
- **All artifacts** (test code, reports) stay in target repo

## Performance Considerations

- **Vector index caching**: `.agent-cache/` stores indexed vectors (safe to delete)
- **RAG is lazy-loaded**: Only loads & indexes when agent runs
- **Tool calls are bounded**: Max 10 iterations per generation attempt
- **Retry is capped**: Max 3 retries per generation (configurable)

## Future Enhancements

See [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) for:
- Additional agents (test case generation, self-healing)
- Multi-framework support (Cypress, Jest, WebdriverIO)
- Custom LLM provider plugins
- Team collaboration & evidence sharing
- Integration with CI/CD pipelines
