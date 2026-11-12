# Test Naming Conventions

## Pattern
```ts
test('should {expected behavior} {when condition or given context}', async () => {
  // ...
});
```

## Good Examples
- `should successfully log in with valid credentials`
- `should display error message when password is empty`
- `should add multiple products to cart`
- `should complete a full purchase workflow`

## Bad Examples (never generate these)
- `test login` — too vague.
- `test 1` — meaningless.

## Suite Naming
Group related tests under a descriptive, hierarchical `describe` block matching the feature area named in the acceptance criteria (e.g. `Authentication - Login`, `Dashboard - Product Inventory`). When a new acceptance criterion doesn't fit an existing suite/file, create a new `describe` block (and, if truly a new feature area, a new spec file) rather than renaming or repurposing an existing one.
