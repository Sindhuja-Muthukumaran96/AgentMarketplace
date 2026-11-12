# Agent Marketplace → ACE-Style Plugin Migration Plan

## Goal
Transform the agent-marketplace into an installable VS Code Agent Plugin (like ACE_Repo) that can be plugged into **any repository** as a Copilot Agent.

## ACE Architecture Key Points

1. **plugin.json** — VS Code Agent Plugins 1.0 metadata
   - Defines the plugin name, version, description
   - Links to homepage/repository
   - Schema-compliant configuration

2. **Skills** — Specialized capabilities
   - Located in `skills/<skill-name>/SKILL.md`
   - Each skill defines its purpose, method, and output format
   - Skills are discoverable by the agent system

3. **Chat Participant** — VS Code API for interactive chat
   - Users type `@agent-name` in Copilot Chat
   - Agent handles conversation turns
   - Streams responses and offers follow-ups
   - Can be installed from Git source directly

4. **Repository-Agnostic**
   - The plugin discovers target repo structure automatically
   - Uses config files + environment variables
   - No hardcoded folder paths or assumptions

## Migration Steps

### Phase 1: Add Agent Plugin Metadata
- [ ] Create `plugin.json` at repo root (matching ACE schema)
- [ ] Update main README.md with plugin installation instructions
- [ ] Add Chat Participant registration logic

### Phase 2: Restructure Skills
- [ ] Create `skills/` directory
- [ ] Move test-script-design agent → `skills/test-script-design/SKILL.md`
- [ ] Define other agents as skills (e.g., test-case-generation, self-healing-tests)
- [ ] Add skill discovery mechanism

### Phase 3: VS Code Integration Layer
- [ ] Create `src/extension.ts` (VS Code extension entry point)
- [ ] Implement `vscode.chat.createChatParticipant()` registration
- [ ] Add chat turn handlers
- [ ] Add response streaming

### Phase 4: Universal Pluggability
- [ ] Enhance agent-core to support Chat Participant protocol
- [ ] Ensure tools work through Chat Participant interface
- [ ] Support context passing from VS Code to agent

### Phase 5: Installation & Testing
- [ ] Test installation from Git source
- [ ] Verify agent works in any repository
- [ ] Document setup steps

## File Structure After Migration

```
agent-marketplace/
├── plugin.json                          # Agent Plugins 1.0 metadata
├── README.md                            # Updated with plugin instructions
├── package.json                         # VS Code extension metadata
├── src/
│   ├── extension.ts                     # VS Code entry point
│   ├── chatParticipant/                 # Chat integration layer
│   │   ├── testScriptDesignParticipant.ts
│   │   └── participantRegistry.ts
│   ├── agents/
│   │   ├── test-script-design-agent.ts  # Refactored agent
│   │   └── orchestrator.ts              # Shared orchestration
│   └── utilities/                       # Shared utilities
├── skills/
│   ├── test-script-design/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── test-case-generation/
│   │   └── SKILL.md
│   └── self-healing-tests/
│       └── SKILL.md
├── packages/
│   ├── agent-core/                      # Shared engine (enhanced)
│   └── test-script-design-agent/        # CLI tool (unchanged)
├── knowledge-base/                      # Global knowledge base
└── docs/
    ├── installation.md
    ├── architecture.md
    ├── extending-agents.md
    └── chat-participant-protocol.md
```

## Key Differences from Current Structure

| Current | After Migration |
|---------|-----------------|
| Agents are npm packages in `packages/` | Agents are skills in `skills/` |
| Used via CLI (`npx agent-name`) | Used via `@agent-name` in Copilot Chat |
| Marketplace web UI lists agents | Plugin system auto-discovers skills |
| Config via `agent.config.json` | Config + VS Code workspace settings |
| Runs in isolated CLI context | Runs with full VS Code API access |

## Implementation Order

1. Create `plugin.json`
2. Update `README.md` with plugin installation
3. Create `skills/` directory structure
4. Create VS Code extension entry point
5. Implement Chat Participant registration
6. Adapt agent-core to Chat Participant protocol
7. Create chat handler for test-script-design agent
8. Test installation and usage
9. Document extending with new agents/skills

## Success Criteria

- ✅ `plugin.json` is valid and follows Agent Plugins 1.0 schema
- ✅ Plugin can be installed via `Chat: Open Customizations` → `Plugins` → `Install from Source`
- ✅ After installation, `@test-script-design` appears in Copilot Chat
- ✅ User can type queries and get test scripts generated
- ✅ Works with any repository (auto-discovery of test structure)
- ✅ Reports are generated in target repo (not in plugin folder)
- ✅ Skills are discoverable and documented
