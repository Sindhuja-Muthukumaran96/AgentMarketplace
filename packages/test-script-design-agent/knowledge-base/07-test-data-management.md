# Test Data Management

## Best Practices
1. Centralize test data in a factory/utility module if the target repository has one — never hardcode credentials or form data directly in a test.
2. Use environment variables for credentials, reading them the same way the repository's existing tests already do.
3. Keep data deterministic — no randomly generated values.
4. Never use real personal data — only synthetic/test data.

## Reuse Before Inventing
Check the target repository's existing test-data utility (discovered automatically from its configured `utilsDir`) for a factory method that already covers the needed data shape. When an acceptance criterion needs data not covered by an existing factory method, follow the exact same naming/return-shape pattern already used there instead of inlining literals in the test.
