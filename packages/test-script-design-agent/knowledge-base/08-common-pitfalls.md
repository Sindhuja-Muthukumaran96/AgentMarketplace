# Common Pitfalls to Avoid When Generating Tests

| Pitfall | Why It's Bad | Correct Approach |
|---|---|---|
| Hardcoded URLs | Breaks in different environments | Use the project's configured `baseURL` + relative paths |
| Global test state | Tests interfere with each other | Use fixtures for isolation |
| Brittle XPath | Breaks on minor UI changes | Use stable test-id attributes |
| Assertions in Page Objects | Hard to debug, unclear responsibility | Keep assertions in test spec files |
| Reassigning a `readonly` page property on a Page Object | Fails type-checking | Use the correct fixture that already binds the right `Page` |
| Random test data | Causes intermittent failures | Use the project's deterministic test-data factory |
| Long multi-scenario tests | Hard to debug, violates single responsibility | Split into focused tests, one business scenario each |
| Ignoring/padding timeouts | Masks real issues | Investigate root cause instead of raising wait timeouts |
| Inventing new locators in the test file | Violates POM encapsulation | Add/reuse a method on the relevant Page Object |
| Calling `.textContent()` without `await` or without a fallback | `string \| null` is not assignable to `string`, fails type-checking | `return (await locator.textContent()) || '';` |
