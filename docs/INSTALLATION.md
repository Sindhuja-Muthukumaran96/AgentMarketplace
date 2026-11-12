# Installation Guide — Agent Marketplace Plugin

This guide explains how to install the Agent Marketplace as a VS Code Agent Plugin and start using AI-powered test generation in your Copilot Chat.

## Prerequisites

- **VS Code**: Version 1.90 or later
- **Copilot Chat**: Must be enabled in your VS Code
- **Target Repository**: A repository with Playwright tests (or where you want to add them)

## Installation Steps

### Option 1: Install from Git Source (Recommended)

This installs the plugin directly from the GitHub repository without publishing to the marketplace.

1. **Open VS Code Customizations**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type `Chat: Open Customizations`
   - Press Enter

2. **Navigate to Plugins**
   - Click the **Plugins** tab
   - You'll see two sections: **User** and **Workspace**
   - Choose **User** for global installation (all repos) or **Workspace** for this repo only

3. **Add the Plugin**
   - Click the **+** button next to your chosen section
   - Select **Install Plugin from Source**
   - Enter the repository URL:
     ```
     https://github.com/xxxxx/testautomation
     ```
   - Click **Install**

4. **Verify Installation**
   - The plugin should appear in your Plugins list
   - Look for "Agent Marketplace" or "ACE Quality Engineer"
   - Ensure it's **enabled** (toggle switch is ON)

5. **Start Using**
   - Open a new Copilot Chat (Ctrl+Shift+Alt+L or Cmd+Shift+Alt+L)
   - Type `@test-script-design` to access the test generation agent
   - Describe your test need: "Generate a test for: Users can log in with valid credentials"

### Option 2: Install from VS Code Marketplace (When Published)

Once the plugin is published to the VS Code Marketplace:

1. **Open Extensions**
   - Click the Extensions icon in the sidebar or press `Ctrl+Shift+X`

2. **Search and Install**
   - Search for "Agent Marketplace" or "ACE Quality Engineer"
   - Click **Install** on the publisher's listing

3. **Enable in Chat Customizations**
   - Press `Ctrl+Shift+P` and open **Chat: Open Customizations**
   - Go to **Plugins** and verify the plugin is listed and enabled

4. **Start Using**
   - Open a new Copilot Chat
   - Type `@test-script-design` and start generating tests

## Troubleshooting Installation

### Issue: Plugin doesn't appear after installation

**Solution:**
- Reload VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`
- Check that Copilot Chat is enabled in VS Code settings
- Verify the plugin is enabled in Chat Customizations

### Issue: "@test-script-design" doesn't show up in autocomplete

**Solution:**
- The agent may still be initializing; wait a few seconds
- Check the Copilot Chat panel for any error messages
- Restart VS Code and Copilot Chat

### Issue: Plugin installation fails with "Invalid repository URL"

**Solution:**
- Verify the repository URL is correct and publicly accessible
- Ensure you have internet connectivity
- Check if the repository is private; you may need to authenticate with GitHub

## Configuration (Optional)

After installation, the agent will **auto-detect** your repository's test structure. To customize:

1. **Create `agent.config.json`** at your repository root:

```json
{
  "pageObjectsDir": "src/pages",
  "fixturesDir": "src/fixtures",
  "testsDir": "tests",
  "generatedTestsSubDir": "tests/generated",
  "testCommand": "npx playwright test {file} --project=chromium",
  "knowledgeBaseDirs": ["docs/testing-standards"]
}
```

2. **Reload VS Code** to pick up the new configuration

See [`docs/PLUGIN_CONFIG.md`](docs/PLUGIN_CONFIG.md) for all configuration options.

## Using the Plugin

### Basic Usage

1. **Open Copilot Chat** (Ctrl+Shift+Alt+L)
2. **Type `@test-script-design`** to mention the agent
3. **Describe your test**, for example:

   ```
   Generate a test for this acceptance criterion:
   
   As a customer,
   when I enter my email and password on the login page,
   then I should see the dashboard homepage.
   ```

4. **Review the generated test**
   - The agent will display the test code
   - It runs the test and reports any failures
   - It auto-fixes issues (up to 3 retries)

5. **Check the artifacts**
   - Test file: `<your-repo>/tests/generated/<test-name>.spec.ts`
   - Report: `<your-repo>/agent-reports/<run-id>.html`

### Advanced: Use Environment Variables (CLI)

If running the agent via command line (instead of Copilot Chat):

```powershell
# Set the LLM provider
$env:AGENT_LLM_PROVIDER = "openai"
$env:OPENAI_API_KEY = "sk-..."

# Run the agent
npx test-script-design-agent run `
  --ac-text "Users can log in with valid credentials" `
  --target-repo ./my-repo `
  --max-retries 3
```

## What Gets Generated

When you run the agent, it creates:

**In your repository:**
- `tests/generated/<test-name>.spec.ts` — the generated test script
- `agent-reports/<run-id>.html` — visual report of the generation process
- `.agent-cache/` — cache for faster re-runs (safe to delete)

**Recommendations:**
```bash
# Add to .gitignore:
agent-reports/
.agent-cache/
```

## Uninstalling

To remove the Agent Marketplace plugin:

1. Open **Chat: Open Customizations**
2. Go to **Plugins**
3. Find "Agent Marketplace" in your User or Workspace plugins
4. Click the **-** button or toggle to disable it
5. To fully remove, you may need to reload VS Code

## Next Steps

- 📖 Read the [Test Script Design Skill guide](skills/test-script-design/SKILL.md) for detailed usage examples
- 📋 Check [`docs/PLUGIN_CONFIG.md`](docs/PLUGIN_CONFIG.md) for repository configuration options
- 🏗️ See [PLUGIN_MIGRATION_PLAN.md](PLUGIN_MIGRATION_PLAN.md) to understand the architecture
- 💡 Learn how to [add new agents](docs/extending-agents.md) (coming soon)

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting-installation) above
- Open an issue on [GitHub](https://github.com/xxxxx/testautomation/issues)
- Review the [skill documentation](skills/test-script-design/SKILL.md)
