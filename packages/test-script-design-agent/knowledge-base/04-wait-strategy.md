# Wait Strategy

## Recommended Patterns
```ts
// Wait for page load states
await this.page.waitForLoadState('networkidle');
await this.page.waitForLoadState('domcontentloaded');

// Wait for element visibility
await this.element.waitFor({ state: 'visible' });

// Implicit waits via Playwright auto-waiting (usually sufficient)
await this.element.click(); // automatically waits for actionability
```

## Forbidden
- `await this.page.waitForTimeout(2000);` — hardcoded sleeps are banned everywhere, including in generated tests.

## Consistency
Match whatever wait pattern the target repository's existing Page Objects already use after state-changing actions (click/submit/navigate) — mirror their exact style (e.g. `waitForLoadState('networkidle')` followed by a log statement) rather than introducing a new pattern.
