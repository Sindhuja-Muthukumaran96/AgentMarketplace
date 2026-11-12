# 🎯 Installation Steps — Agent Marketplace Plugin

This is a quick reference for installing the Agent Marketplace plugin into VS Code.

## Prerequisites Check

Before installing, ensure you have:

- ✅ **VS Code** version 1.90 or later
- ✅ **Copilot Chat** extension enabled
- ✅ **Internet connection** (to download from GitHub)
- ✅ **Git** (optional, for troubleshooting)

## Installation (4 Steps)

### Step 1: Open VS Code Customizations

**Keyboard shortcut:**
- Windows/Linux: `Ctrl+Shift+P`
- Mac: `Cmd+Shift+P`

**Or menu:**
- Click `View` → `Command Palette`

### Step 2: Search for "Chat: Open Customizations"

In the command palette that appears:
1. Type: `Chat: Open Customizations`
2. Press `Enter`

A panel opens showing your Chat customizations.

### Step 3: Navigate to Plugins and Add

In the customizations panel:
1. Click the **Plugins** tab
2. You'll see two sections: **User** and **Workspace**
   - **User** = install for all repositories on this machine
   - **Workspace** = install for just this repository
3. Choose your preferred scope
4. Click the **+** button next to your choice

A dropdown menu appears.

### Step 4: Install from Source

In the dropdown:
1. Click **Install Plugin from Source**
2. Paste the repository URL:
   ```
   https://github.com/xxxxx/testautomation
   ```
3. Click **Install** (or press Enter)

VS Code downloads and installs the plugin.

## Verification

After installation completes:

1. Look for **Agent Marketplace** or **ACE Quality Engineer** in your Plugins list
2. Verify the toggle switch is **ON** (enabled)
3. Close the Customizations panel (click the X)

## First Use

Now that the plugin is installed:

1. **Open Copilot Chat**
   - Windows/Linux: `Ctrl+Shift+Alt+L`
   - Mac: `Cmd+Shift+Alt+L`
   - Or: Click the Copilot Chat icon in the sidebar

2. **Type a message mentioning the agent**
   ```
   @test-script-design
   Generate a test for: Users can log in with valid credentials
   ```

3. **Press Enter**
   - The agent processes your request
   - A test script is generated
   - The test runs automatically
   - Results appear in the chat

## Troubleshooting Installation

### Issue 1: Plugin doesn't appear after installation

**Solutions:**
- Reload VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`
- Check Copilot Chat is enabled: `Ctrl+Shift+P` → `Chat: Focus Chat`
- Restart VS Code completely

### Issue 2: "@test-script-design" doesn't autocomplete in chat

**Solutions:**
- Wait 5-10 seconds for initialization
- Try typing just `@` to see all available agents
- Reload: `Ctrl+Shift+P` → `Developer: Reload Window`

### Issue 3: Installation fails with "Invalid repository URL"

**Solutions:**
- Verify the URL: `https://github.com/xxxxx/testautomation`
- Check your internet connection
- Try again in a few moments (temporary GitHub access issues)
- Check if the repository is private (you may need to authenticate)

### Issue 4: Installation fails with "Plugin format error"

**Solutions:**
- Verify you're installing an Agent Plugin (not a regular extension)
- Check VS Code version: needs 1.90 or later
- Try updating VS Code to the latest version
- Reload VS Code

### Issue 5: "Chat: Open Customizations" command not found

**Solutions:**
- Ensure Copilot Chat extension is installed
- Install from Command Palette: `Extensions: Install Extensions` → search "Copilot Chat"
- Restart VS Code after installing

## Uninstalling

To remove the plugin:

1. `Ctrl+Shift+P` → `Chat: Open Customizations`
2. Go to **Plugins** tab
3. Find **Agent Marketplace** in your list
4. Click the **-** button to remove
5. Or toggle the switch to disable (without removing)
6. Close the customizations panel

## Next Steps After Installation

1. **Try the quick start:** [QUICKSTART.md](QUICKSTART.md)
2. **Learn the agent:** [skills/test-script-design/SKILL.md](skills/test-script-design/SKILL.md)
3. **Customize your repo:** [docs/PLUGIN_CONFIG.md](docs/PLUGIN_CONFIG.md) (optional)
4. **Understand the system:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Offline Setup (Advanced)

If you need to install without internet or from a private repository:

1. Clone the repository locally:
   ```bash
   git clone https://github.com/xxxxx/testautomation.git
   cd agent-marketplace
   ```

2. In VS Code: `Ctrl+Shift+P` → `Chat: Open Customizations`

3. Click **Plugins** → **+** → **Install Plugin from Source**

4. Enter the local path:
   ```
   file:///C:/path/to/agent-marketplace
   ```

5. Click **Install**

(Note: Paths may vary on Mac/Linux)

## Support

If you encounter issues:

1. **Review troubleshooting** above
2. **Check documentation:** [docs/INSTALLATION.md](../docs/INSTALLATION.md)
3. **Open an issue** on [GitHub](https://github.com/xxxxx/testautomation/issues)
4. **Contact support** (if available)

---

**That's it!** You're ready to use the Agent Marketplace plugin. 🎉

**Start here:** [QUICKSTART.md](QUICKSTART.md) (5 minutes)
