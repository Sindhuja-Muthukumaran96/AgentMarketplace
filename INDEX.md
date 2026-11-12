# Documentation Index

Welcome! This guide helps you navigate all documentation for the Agent Marketplace plugin.

## 🚀 Getting Started (Start Here!)

| Guide | Time | For Whom | Contains |
|-------|------|----------|----------|
| [QUICKSTART.md](QUICKSTART.md) | 5 min | New users | Installation + first test |
| [README.md](README.md) | 10 min | Everyone | Overview + feature summary |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | 15 min | Installing | Detailed setup + troubleshooting |

## 📚 Understanding the Plugin

| Document | Purpose | Audience | Depth |
|----------|---------|----------|-------|
| [OVERVIEW.md](OVERVIEW.md) | Full transformation overview | Developers | Complete picture |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design + data flows | Developers | Technical details |
| [TRANSFORMATION_SUMMARY.md](TRANSFORMATION_SUMMARY.md) | What changed and why | Stakeholders | Summary of changes |
| [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) | Design decisions + roadmap | Architects | Future direction |

## 🎯 Using the Agent

| Document | When to Use | Contains |
|----------|-------------|----------|
| [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md) | Learning the agent | Purpose, examples, configuration |
| [docs/PLUGIN_CONFIG.md](docs/PLUGIN_CONFIG.md) | Customizing behavior | Configuration reference |
| [packages/test-script-design-agent/README.md](packages/test-script-design-agent/README.md) | CLI usage (advanced) | Command-line details |

## 🔧 Development & Extension

| Document | For Building | Contains |
|----------|--------------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Understanding codebase | Component responsibilities |
| [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) | Adding new agents | Extension points + roadmap |

## 📋 File Organization

```
agent-marketplace/
├── QUICKSTART.md              ← START HERE (5 min)
├── README.md                  ← Overview
├── OVERVIEW.md                ← Complete transformation
├── INDEX.md                   ← This file
│
├── plugin.json                ← VS Code plugin metadata
├── package.json               ← Node/extension config
│
├── skills/
│   └── test-script-design/
│       └── SKILL.md           ← Agent documentation
│
├── docs/
│   ├── INSTALLATION.md        ← Setup guide
│   ├── ARCHITECTURE.md        ← System design
│   ├── PLUGIN_CONFIG.md       ← Configuration reference
│   └── PLUGIN_MIGRATION_PLAN.md ← Roadmap & design
│
├── packages/
│   ├── agent-core/            ← Shared engine
│   │   └── README.md
│   └── test-script-design-agent/
│       └── README.md          ← CLI details
│
└── [other source files]
```

## 🎓 Learning Path

### Level 1: User (Just want to use it)
1. [QUICKSTART.md](QUICKSTART.md) — Installation (5 min)
2. [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md) — How to use (10 min)
3. Start generating tests! 🎉

### Level 2: Power User (Want to customize)
1. Finish Level 1
2. [docs/PLUGIN_CONFIG.md](docs/PLUGIN_CONFIG.md) — Configuration (5 min)
3. Create `agent.config.json` in your repo
4. Advanced usage with custom test commands

### Level 3: Developer (Want to extend it)
1. Finish Level 2
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design (20 min)
3. [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) — Extension points (15 min)
4. Add new agents or modify existing ones

### Level 4: Architect (Want to integrate at scale)
1. Finish Level 3
2. [TRANSFORMATION_SUMMARY.md](TRANSFORMATION_SUMMARY.md) — Design decisions (10 min)
3. [OVERVIEW.md](OVERVIEW.md) — Mapping to ACE_Repo (10 min)
4. Plan enterprise deployment

## 🔍 Find Answers To...

**"How do I install this?"**
→ [QUICKSTART.md](QUICKSTART.md) or [docs/INSTALLATION.md](docs/INSTALLATION.md)

**"How do I use the @test-script-design agent?"**
→ [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md)

**"Why did you structure it this way?"**
→ [TRANSFORMATION_SUMMARY.md](TRANSFORMATION_SUMMARY.md) or [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md)

**"How does the system work internally?"**
→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

**"Where do test files get created?"**
→ [docs/PLUGIN_CONFIG.md](docs/PLUGIN_CONFIG.md)

**"How can I add a new agent?"**
→ [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) (Extension Points section)

**"What if something breaks?"**
→ [docs/INSTALLATION.md](docs/INSTALLATION.md) (Troubleshooting section)

**"How is this like ACE_Repo?"**
→ [OVERVIEW.md](OVERVIEW.md) (Comparison with ACE_Repo section)

## 📊 Documentation Statistics

| Document | Words | Read Time | Purpose |
|----------|-------|-----------|---------|
| QUICKSTART.md | 800 | 5 min | Setup & basic usage |
| README.md | 1,500 | 10 min | Overview |
| docs/INSTALLATION.md | 3,000 | 15 min | Installation guide |
| skills/test-script-design/SKILL.md | 2,500 | 15 min | Agent guide |
| docs/ARCHITECTURE.md | 5,000 | 25 min | System design |
| OVERVIEW.md | 3,000 | 15 min | Transformation overview |
| TRANSFORMATION_SUMMARY.md | 2,000 | 10 min | What changed |
| PLUGIN_MIGRATION_PLAN.md | 2,500 | 12 min | Roadmap |
| docs/PLUGIN_CONFIG.md | 1,500 | 10 min | Configuration |

**Total:** ~22,000 words, ~2-3 hours of reading

## 🏃 Quick Reference

### Installation (copy/paste)
```powershell
# 1. Press Ctrl+Shift+P
# 2. Type: Chat: Open Customizations
# 3. Click Plugins → + → Install from Source
# 4. Paste: https://github.com/xxxxx/testautomation
# 5. Done! Use @test-script-design in Copilot Chat
```

### Basic Usage
```
@test-script-design
Generate a test for: Users can log in with valid email and password
```

### Configuration (optional)
Create `agent.config.json` at repo root:
```json
{
  "pageObjectsDir": "src/pages",
  "testCommand": "npx playwright test {file}"
}
```

## 🆘 Troubleshooting Quick Links

- Plugin won't install → [docs/INSTALLATION.md](docs/INSTALLATION.md#issue-plugin-installation-fails)
- Agent doesn't appear → [docs/INSTALLATION.md](docs/INSTALLATION.md#issue-test-script-design-doesnt-show-up)
- Tests failing → [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md#troubleshooting)
- Config not working → [docs/PLUGIN_CONFIG.md](docs/PLUGIN_CONFIG.md)

## 📞 Getting Help

1. **Check the relevant documentation** using this index
2. **Search for your issue** in the Troubleshooting sections
3. **Review examples** in [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md#examples)
4. **Check the architecture** if confused about how it works: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
5. **Open an issue** on GitHub (link in plugin.json)

## 📖 Related Documentation

- [VS Code Agent Plugins 1.0 Specification](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)
- [ACE_Repo Reference](https://github.com/csrameshbabu/ACE_Repo)
- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Patterns](https://playwright.dev/docs/pom)

---

**You're all set!** Pick a guide above and get started. 🚀
