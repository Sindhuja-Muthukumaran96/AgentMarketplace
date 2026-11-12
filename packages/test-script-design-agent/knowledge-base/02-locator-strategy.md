# Locator Strategy (In Priority Order)

1. Stable test-id attributes (recommended): `page.locator('[data-testid="login-button"]')` or whichever test-id convention the target application uses (`data-test`, `data-cy`, `data-qa`, etc.) — always prefer these when present.
2. ARIA labels: `page.getByLabel('Username')`.
3. Placeholder text: `page.getByPlaceholder('Enter email')`.
4. Role + accessible name: `page.getByRole('button', { name: 'Submit' })`.
5. CSS class (only if necessary): `page.locator('.primary-button')`.
6. XPath — avoid; only as an absolute last resort because it is brittle and slower than other strategies.

## Rules
- Never introduce a new locator strategy when an existing Page Object already exposes a `readonly Locator` or method covering the same element — reuse it.
- When adding a new locator, follow the exact same attribute convention already used throughout the target repository's existing Page Objects.
- Locators that resolve a list of elements should be exposed as plural fields and iterated with `.all()`/`.nth(index)` inside a method, never directly in the test.
