# Testing

Rules for what data each test level may use and how tests reach a database. The decision and its reasons are in [ADR 0011](../adr/ADR0011-tests-reach-only-a-local-supabase-with-seed-data.md).

For any change that adds or edits a test:
- Read this file first.

## Test levels and their data

| Level | Files | Data | Reaches Supabase |
| --- | --- | --- | --- |
| Unit | `src/**/*.unit.test.ts(x)`, `tests/support/**/*.unit.test.ts` | **Mock data** built in the test or in a test helper | Never |
| Integration | `src/**/*.integration.test.ts` | **Seed data** in the local Supabase | Local only |
| E2E | `tests/e2e/**/*.spec.ts` | **Seed data** in the local Supabase | Local only |

- **Unit tests use mock data only.** They never import `src/repositories/supabaseClient.ts` or make network calls; a component test mocks the repository function it uses. Mock external I/O (a CLI call, `fetch`), never the unit under test. A component unit test gets a fresh `QueryClient` with `retry: false`.
- **Integration and E2E tests run against the local Supabase** (`supabase start`), loaded with the migrations and `supabase/seed.sql`. They only read the shared seed, so they can run in parallel. A test that needs to prove a write is refused may try it, but must assert that the data is unchanged afterwards.
- **E2E tests intercept Supabase requests only for states the seed data can't produce**, such as an empty table, a server error, or a specific subset of rows. Everything else goes to the real local API.
- **Production data is never used by any test.** It is never committed, never copied into the seed or a fixture, and never loaded into a local or CI database. Production data scripts live in the gitignored `supabase/data/`.
- **Seed data and mock data are fictional.** Don't reuse real people's names from production data.

## Reaching the database

- Every test that reaches a database gets its URL and publishable key from `tests/support/localSupabaseEnv.ts`. It reads `supabase status -o json` and refuses any host other than `127.0.0.1` or `localhost`.
- The test configs pass those values as process environment variables (`test.env` in `vitest.integration.config.ts`, `webServer.env` in `playwright.config.ts`). Process variables take precedence over `.env*` files, so a `.env.local` pointing at a shared project can't reach a test run.
- Don't hand-write connection settings (URLs, keys) in a test or a config.

## Seed data

- `supabase/seed.sql` holds the fictional rows that integration and E2E expectations depend on. `supabase db reset` restores it.
- When a test relies on a count or an edge case in the seed, a seed integration test checks it, so a later edit to the seed fails there first.
- Every new table that tests depend on gets fictional rows in `supabase/seed.sql`.

## Test quality

- Every test has a non-trivial assertion. No `expect(true).toBe(true)` and no empty test bodies.
- No skipped tests (`it.skip`, `describe.skip`, `test.skip`) in committed code.
- E2E tests assert structure, never pixels ([ADR 0009](../adr/ADR0009-e2e-tests-do-not-use-pixel-snapshots.md)).
