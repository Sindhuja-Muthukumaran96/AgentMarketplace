# Page Object Model (POM) Design Standards

## Core Principles
1. One Page Object per page/screen — never combine unrelated pages.
2. Encapsulate locators and interactions — locators are `readonly` and initialized in the constructor.
3. Expose business-oriented methods — methods describe what the user does (`login`, `addProductToCart`), not how.
4. Keep it simple — avoid over-engineering; only add methods when a test actually needs them.
5. Prefer a shared base class (e.g. `BasePage`) for common functionality (navigation, waits, logging) that every page object inherits from, if the target repository has one.

## Reuse Before Creating
Before writing any new locator or test logic, always check the repository's existing Page Objects and fixtures (discovered automatically from the target repo's configured `pageObjectsDir` / `fixturesDir`) for a method that already does what's needed. Only add a new method or Page Object when nothing reusable exists.

## Forbidden Patterns in Page Objects
- Hardcoded sleeps: `await page.waitForTimeout(1000)`.
- Generic/brittle XPath: `//button`, `//div[@class='btn']`.
- Overly specific CSS chains: `body > div > div > button`.
- Assertions (`expect(...)`) inside Page Objects — keep assertions in test spec files.
- Hardcoded test data inside Page Objects.
- Multiple unrelated responsibilities in a single method.

## Verification Methods Are OK
Page Objects may expose boolean/string "is/get" verification methods that *return* state for the test to assert on, e.g. `isErrorMessageVisible(): Promise<boolean>` or `getErrorMessage(): Promise<string>`. They must never call `expect()` themselves.
