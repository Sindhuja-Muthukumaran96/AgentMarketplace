# Quick Start Guide

Welcome! This is a VS Code Agent Plugin for test automation. Follow these steps to get started.

## 5-Minute Setup

### Step 1: Install the Plugin in VS Code

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type `Chat: Open Customizations` and press Enter
3. Click **Plugins** tab
4. Click the **+** button next to **User** or **Workspace**
5. Select **Install Plugin from Source**
6. Enter: `https://github.com/xxxxx/testautomation`
7. Click **Install**

### Step 2: Start a Copilot Chat

1. Press `Ctrl+Shift+Alt+L` (Windows/Linux) or `Cmd+Shift+Alt+L` (Mac)
2. A new Copilot Chat window opens

### Step 3: Use the Agent

In the chat, type:
```
@test-script-design
Generate a test for: Users can log in with valid email and password
```

Press Enter. The agent will:
- Discover your repo's Page Objects and fixtures
- Generate a complete Playwright test
- Run it automatically
- Report the results

Done! 🎉

## What Gets Created

The agent creates test files in your repository:
- **Test file**: `tests/generated/<test-name>.spec.ts`
- **Report**: `agent-reports/<run-id>.html`

Add to `.gitignore`:
```
agent-reports/
.agent-cache/
```

## Common Requests

### Generate a login test
```
@test-script-design
Create a test for: Users can log in with email and password, 
then see their dashboard homepage
```

### Generate a form validation test
```
@test-script-design
Generate a test that verifies:
When users enter an invalid email format, they see an error message
```

### Generate a checkout flow test
```
@test-script-design
Test this acceptance criterion:
Users can add products to the cart and complete checkout with payment
```

## Customize Your Repository (Optional)

Create `agent.config.json` at your repo root:

```json
{
  "pageObjectsDir": "src/pages",
  "fixturesDir": "src/fixtures",
  "testCommand": "npx playwright test {file}",
  "generatedTestsSubDir": "tests/generated"
}
```

## Need Help?

- 📖 **Installation issues?** → See [docs/INSTALLATION.md](docs/INSTALLATION.md)
- 🏗️ **How does it work?** → See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 💡 **More examples?** → See [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md)
- ⚙️ **Configuration?** → See [docs/PLUGIN_CONFIG.md](docs/PLUGIN_CONFIG.md)

## What's Next?

- Run your generated tests: `npx playwright test`
- Add more acceptance criteria
- Customize test data and fixtures
- Integrate into your CI/CD pipeline
- [See the full roadmap →](PLUGIN_MIGRATION_PLAN.md)

---

**Happy testing!** 🚀
