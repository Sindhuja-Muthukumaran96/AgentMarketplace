# Assertion Strategy

## Where Assertions Live
Assertions belong in test spec files, never inside Page Object methods.

```ts
// Good: Page Object returns state, test asserts
expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
```

```ts
// Bad: assertion embedded in a Page Object method
async loginAndVerify(user, pass): Promise<void> {
  await this.login(user, pass);
  expect(await this.isDashboardLoaded()).toBeTruthy(); // ❌ never do this
}
```

## Best Practices
- Use the project's existing test/expect import (commonly re-exported from a shared fixtures file) rather than importing `@playwright/test` directly if the repo has its own fixtures module.
- Write specific assertions tied to a single behavior per `expect` call.
- Avoid vague assertions like `expect(locator).toBeTruthy()` with no context — assert on the concrete returned value (count, text, boolean) from a Page Object verification method.
- When checking list lengths (e.g. cart item counts), assert exact numeric deltas (e.g. `expect(finalCount).toBe(initialCount - 1)`) rather than just truthiness.
