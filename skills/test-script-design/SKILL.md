---
name: test-script-design
description: Generate Playwright + TypeScript test scripts from acceptance criteria, grounded in the target repository's actual Page Objects, fixtures, and quality standards
---

# Test Script Design Skill

Use this skill when you need to generate an automated test script from a user story or acceptance criterion.

## What this skill does

1. **Understands your repository** — automatically discovers Page Objects, fixtures, test utilities, and coding standards
2. **Retrieves relevant context** — uses RAG (Retrieval-Augmented Generation) to find similar tests and standards from your repo + bundled best practices
3. **Generates grounded test code** — creates a complete Playwright + TypeScript test that:
   - Follows your repository's exact conventions and naming
   - Reuses existing Page Objects, fixtures, and test data (doesn't reinvent)
   - Satisfies the acceptance criterion exactly
4. **Validates with real execution** — runs the generated test against your test infrastructure and auto-corrects failures
5. **Produces a report** — creates an artifact documenting the generation process, test code, and execution results

## When to use this skill

User requests like:
- "Generate a test for: Users can log in with valid credentials"
- "Create a test that verifies the payment confirmation page displays correctly"
- "Write an automated test for the checkout flow acceptance criteria"
- "Generate tests for: Users should receive an error message for invalid email format"

## How to use it

In a Copilot Chat with the `@test-script-design` agent, describe the acceptance criterion or user story. Example:

```
User Acceptance Criterion:
As a customer,
when I enter a valid email and password,
then I should see the dashboard homepage

Test Framework: Playwright + TypeScript
Target Environment: Chrome browser
```

The agent will:
1. Auto-detect your repository's Page Object structure
2. Search for similar tests and reusable components
3. Generate a complete test script
4. Run it against your test infrastructure
5. Fix any failures automatically (up to 3 retries)
6. Provide a report with the test code and execution summary

## Configuration

The agent discovers your repository's structure automatically:
- **Page Objects**: `src/pages`, `pages`, `page-objects`
- **Fixtures**: `src/fixtures`, `fixtures`, `tests/fixtures`
- **Test utilities**: `src/utils`, `utils`, `src/helpers`
- **Test directory**: `tests`, `test`, `e2e`, `playwright-tests`

Optionally, create an `agent.config.json` at your repo root to override defaults:

```json
{
  "pageObjectsDir": "src/pages",
  "fixturesDir": "src/fixtures",
  "utilsDir": "src/utils",
  "testsDir": "tests",
  "generatedTestsSubDir": "tests/generated",
  "knowledgeBaseDirs": ["docs/testing-standards"],
  "testCommand": "npx playwright test {file} --project=chromium"
}
```

## Output

The skill generates and saves:
- **Test file**: `<target-repo>/<testsDir>/generated/<slug>.spec.ts` — the complete test script
- **Execution report**: `<target-repo>/agent-reports/<run-id>.html` — visual summary with test code, results, and any retry details
- **JSON report**: `<target-repo>/agent-reports/<run-id>.json` — structured data for CI integration

## Troubleshooting

**Question**: Why is the generated test failing?
- **Check**: The repository's `testCommand` in `agent.config.json` or environment. The agent re-runs the test and fixes errors automatically.

**Question**: The test doesn't reuse an existing Page Object I know exists.
- **Check**: The Page Object must be in the configured `pageObjectsDir` and export a class. Verify the path in `agent.config.json`.

**Question**: How do I disable automatic retry?
- **Check**: Set `AGENT_MAX_RETRIES=0` or `--max-retries 0` if running via CLI.

**Question**: Can I use this with other test frameworks (Cypress, Jest)?
- **Note**: Currently Playwright + TypeScript only. Support for other frameworks may be added in future versions.

## Behind the scenes

The agent runs in five phases:
1. **Input** — accepts an acceptance criterion
2. **Retrieval** — queries your repo's code + the bundled knowledge base for relevant context
3. **Generation** — the LLM calls tools to explore your repo, then generates a complete test
4. **Validation** — executes the test; feeds back failures for automatic correction (up to 3 retries)
5. **Reporting** — generates HTML/JSON reports documenting the entire run

All generated artifacts stay in your repository. The agent itself is stateless and can be run repeatedly against any repository.

## Examples

### Example 1: Simple login test

**Criterion:**
```
Users can log in with a valid username and password on the login page.
When they click the Login button, they should see their dashboard.
```

**Generated test structure:**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUser } from '../fixtures/test-users';

test('User can log in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await loginPage.goto();
  await loginPage.login(testUser.validEmail, testUser.validPassword);
  
  await expect(dashboardPage.welcomeHeader).toBeVisible();
});
```

### Example 2: Form validation test

**Criterion:**
```
When users enter an invalid email format in the signup form and click Submit,
they should see an inline error message: "Please enter a valid email address."
```

**Generated test structure:**
```typescript
import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';

test('Displays error for invalid email format', async ({ page }) => {
  const signupPage = new SignupPage(page);
  
  await signupPage.goto();
  await signupPage.fillEmail('not-an-email');
  await signupPage.clickSubmit();
  
  await expect(signupPage.emailErrorMessage).toContainText('Please enter a valid email address');
});
```

## See also

- [Test Script Design Agent README](../../packages/test-script-design-agent/README.md)
- [Repository Configuration](../../docs/PLUGIN_CONFIG.md)
- [Knowledge Base Standards](../../packages/test-script-design-agent/knowledge-base/)
