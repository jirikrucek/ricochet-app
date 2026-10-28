# Testing

Rules for what data each test level may use and how tests reach a database. The decision and its reasons are in [ADR 0011](../adr/ADR0011-tests-reach-only-a-local-supabase-with-seed-data.md).

## Test levels and their data

| Level | Files | Data | Reaches Supabase |
| --- | --- | --- | --- |
| Unit | `src/**/*.unit.test.ts(x)`, `tests/support/**/*.unit.test.ts` | **Mock data** built in the test or in a test helper | Never |
| Integration | `src/**/*.integration.test.ts` | **Seed data** in the local Supabase | Local only |
| E2E | `tests/e2e/**/*.spec.ts` | **Seed data** in the local Supabase | Local only |

- **Unit tests use mock data only.** They never reach the network; a component test mocks the repository function it uses, and a repository test passes in a fake client (loading `supabaseClient.ts` needs the two `VITE_SUPABASE_*` variables, so the test stubs them first). A component unit test gets a fresh `QueryClient` with `retry: false`.
- **Integration and E2E tests run against the local Supabase** (`supabase start`), loaded with the migrations and `supabase/seed.sql`. They only read the shared seed, so they can run in parallel. A test that needs to prove a write is refused may try it, but must assert that the data is unchanged afterwards.
- **E2E tests intercept Supabase requests only for states the seed data can't produce**, such as an empty table, a server error, or a specific subset of rows. Everything else goes to the real local API.
- **Production data is never used by any test.** It is never committed, never copied into the seed or a fixture, and never loaded into a local or CI database. Production data scripts live in the gitignored `supabase/data/`.
- **Seed data and mock data are fictional.** Don't reuse real people's names from production data.

## Reaching the database

- Every test that reaches a database gets its URL and publishable key from `tests/support/localSupabaseEnv.ts`. It reads `supabase status -o json` and refuses any host other than `127.0.0.1` or `localhost`.
- The Vitest integration project and Playwright (its global setup and the web server wrapper) put those values in the process environment. Process variables take precedence over `.env*` files, so a `.env.local` pointing at a shared project can't reach a test run.
- A test that reaches a database never hand-writes connection settings (URLs, keys), in the test or in a config.

## Seed data

- `supabase/seed.sql` holds the fictional rows that integration and E2E expectations depend on.
- When a test relies on a count or an edge case in the seed, a seed integration test checks it, so a later edit to the seed fails there first.
- Every new table that tests depend on gets fictional rows in `supabase/seed.sql`.

## E2E page loads

- Page loads don't depend on the internet. The app bundles third-party assets (webfonts, CDN scripts) instead of loading them from another host, as it does with the Inter font and the flags ([ADR 0006](../adr/ADR0006-language-selector-uses-native-labels-and-flags.md)). Such a request holds up every `page.goto`, and a slow host fails the test.
- A test that measures layout opens the page with `openAt` or `openOverview`. They wait for the fonts to load, so the test measures the final text widths.

## Test quality

- Mock external I/O only (a CLI call, `fetch`), never the unit under test.
- Every test has a non-trivial assertion. No `expect(true).toBe(true)` and no empty test bodies.
- No skipped tests (`it.skip`, `describe.skip`, `test.skip`) in committed code.
- E2E tests assert structure (roles, attributes, sizes), never pixels, because screenshots differ per OS ([ADR 0009](../adr/ADR0009-e2e-tests-do-not-use-pixel-snapshots.md)). ESLint rejects `toHaveScreenshot` and `toMatchSnapshot` in `tests/e2e`.
