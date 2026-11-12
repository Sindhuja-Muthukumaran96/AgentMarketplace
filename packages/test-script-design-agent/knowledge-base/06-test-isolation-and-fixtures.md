# Test Isolation, Independence & Fixtures

## Core Rules
1. Tests must not depend on execution order — any test should pass standalone or in any sequence.
2. Each test sets up its own state via fixtures; never share mutable state between tests (no module-level `let` variables holding user/session data).
3. Clean up after yourself where the app/session allows it.
4. Use deterministic test data — no randomly generated values that can cause flakiness.

## Fixture Usage
Always check the target repository's existing fixtures file (discovered automatically from its configured `fixturesDir`) before writing a test. Reuse whatever pre-authenticated page / dependency-injected Page Object fixtures already exist instead of manually instantiating Page Objects or re-implementing login/setup inside the test body.

```ts
// Good: use fixtures, no manual page re-assignment needed
test('should add product to cart', async ({ dashboardPage }) => {
  await dashboardPage.waitForDashboard();
  await dashboardPage.addProductToCart(0);
});
```

Never assign to `somePageObject.page = ...` if `page` is declared `readonly` on the base page class — the fixture already wires the correct `Page` instance into each Page Object.
