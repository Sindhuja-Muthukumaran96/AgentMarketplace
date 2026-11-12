@echo off
REM Push Agent Marketplace to GitHub
REM Repository: https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace

echo.
echo ============================================================
echo    Pushing Agent Marketplace to GitHub
echo ============================================================
echo.

REM Navigate to project directory
cd /d C:\agent-marketplace
echo Working directory: %CD%
echo.

REM Step 1: Initialize Git
echo Step 1: Initializing Git repository...
git init
if errorlevel 1 (
    echo Error: Git not found. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo.

REM Step 2: Configure Git
echo Step 2: Configuring Git user...
git config user.name "Sindhuja-Muthukumaran96"
git config user.email "your.email@example.com"
echo.

REM Step 3: Add all files
echo Step 3: Staging all files...
git add .
echo.

REM Step 4: Create commit
echo Step 4: Creating commit...
git commit -m "Initial commit: Agent Marketplace as VS Code Agent Plugin"
echo.

REM Step 5: Add remote
echo Step 5: Adding GitHub remote...
git remote add origin https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace.git
echo.

REM Step 6: Set main branch and push
echo Step 6: Setting main branch...
git branch -M main
echo.

REM Step 7: Push to GitHub
echo Step 7: Pushing to GitHub...
echo.
echo You may be prompted to authenticate with GitHub.
echo Use your GitHub credentials or Personal Access Token.
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo Error: Push failed. Check the error above.
    echo.
    echo Troubleshooting:
    echo   - Verify Git is installed: git --version
    echo   - Check your GitHub credentials
    echo   - Ensure the repository exists on GitHub
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Success! Your plugin is now available at:
echo https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace
echo ============================================================
echo.
echo Users can now install it with:
echo   Chat: Open Customizations ^> Plugins ^> Install from Source
echo   URL: https://github.com/Sindhuja-Muthukumaran96/AgentMarketplace
echo.
pause
