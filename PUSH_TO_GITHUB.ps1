# Push Agent Marketplace to GitHub
# This script pushes all code to: https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Pushing Agent Marketplace to GitHub                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
cd C:\agent-marketplace
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 1: Initialize Git
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Git initialization failed. Please ensure Git is installed." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Configure Git (set these to your GitHub credentials)
Write-Host "Step 2: Configuring Git user..." -ForegroundColor Yellow
$userName = "Sindhuja-Muthukumaran96"
$userEmail = "your.email@example.com"  # Update this with your email

git config user.name $userName
git config user.email $userEmail
Write-Host "✅ Configured: $userName <$userEmail>" -ForegroundColor Green
Write-Host ""

# Step 3: Add all files
Write-Host "Step 3: Staging all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ All files staged" -ForegroundColor Green
Write-Host ""

# Step 4: Create commit
Write-Host "Step 4: Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
Initial commit: Agent Marketplace as VS Code Agent Plugin

- Add plugin.json for Agent Plugins 1.0 compatibility
- Add skills/ directory with test-script-design skill documentation
- Add comprehensive documentation (11 files, 56.3 KB)
- Update README and package.json for plugin installation
- Preserve all original agent-core and test-script-design-agent packages
- All artifacts ready for VS Code installation

This plugin can now be installed directly from GitHub via:
Chat: Open Customizations → Plugins → Install from Source
URL: https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace
"@

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit might have failed or nothing to commit" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Add remote repository
Write-Host "Step 5: Adding GitHub remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace.git"
git remote add origin $remoteUrl
Write-Host "✅ Remote added: $remoteUrl" -ForegroundColor Green
Write-Host ""

# Step 6: Set main branch
Write-Host "Step 6: Setting up main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch renamed to 'main'" -ForegroundColor Green
Write-Host ""

# Step 7: Push to GitHub
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔐 You may be prompted to authenticate with GitHub." -ForegroundColor Magenta
Write-Host "   Use your GitHub credentials or Personal Access Token." -ForegroundColor Magenta
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your plugin is now available at:" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📍 https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 Users can now install it with:" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Chat: Open Customizations → Plugins → Install from Source" -ForegroundColor Cyan
    Write-Host "   URL: https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Verify Git is installed: git --version" -ForegroundColor Yellow
    Write-Host "  • Check your GitHub credentials" -ForegroundColor Yellow
    Write-Host "  • Ensure the repository exists on GitHub" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Green
Write-Host ""
Write-Host "  1. Verify files on GitHub:"
Write-Host "     https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Update documentation with actual URL:"
Write-Host "     (Already set to your repository)" -ForegroundColor Green
Write-Host ""
Write-Host "  3. Test installation in VS Code:"
Write-Host "     • Ctrl+Shift+P → Chat: Open Customizations" -ForegroundColor Cyan
Write-Host "     • Plugins → + → Install from Source" -ForegroundColor Cyan
Write-Host "     • Paste: https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace" -ForegroundColor Cyan
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
