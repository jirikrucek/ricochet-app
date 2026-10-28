# ADR 0011: Tests Reach Only a Local Supabase with Seed Data

- Status: Accepted
- Created: 2026-10-19
- Updated: 2026-10-28

## Context

The **player overview** (issue #58) adds the first Supabase table, so this is the first time integration and E2E tests need a database. The real **players** are **production data**. They exist only in the shared Supabase project, which serves both preview and production, and they are loaded by hand with a script kept outside Git. Developers' `.env.local` files can point at that shared project.

The tests must run the same way on macOS, in the dev container, and in CI (as with ADR 0009). They must never read or change **production data**, and E2E expectations such as counts, sort orders, and page numbers need data that doesn't change underneath them.

## Decision

Tests use data according to their level:

- Unit tests use **mock data** only and never reach Supabase.
- Integration and E2E tests run against a local Supabase, started with `supabase start` in Docker and loaded with migrations plus the committed, fictional **seed data** (`supabase/seed.sql`).
- E2E tests intercept Supabase requests only for states the **seed data** can't produce, such as an empty table or a server error.
- **Production data** is never used by any test, never committed, and never loaded into local or CI databases.

Every test that reaches a database gets its URL and publishable key from a single helper (`tests/support/localSupabaseEnv.ts`). The helper reads `supabase status -o json` and refuses any host other than `127.0.0.1` or `localhost`. Test configs pass these values through process environment variables, so they take precedence over any `.env*` file. CI starts the local Supabase itself and uses the same helper.

`docs/standards/testing-standard.md` holds the detailed rules. This ADR records the decision and the reasons behind it.

## Alternatives Considered

- A hosted Supabase test project. Rejected: it is a shared, mutable dependency between developers and CI runs, it needs secrets in CI, and it can't be reset per run.
- A committed `.env.test` with the local publishable key the CLI prints. Rejected: that key is a CLI default that can change between versions, a stale key fails in confusing ways, and a static file can't check that Supabase is running or that the URL is local.
- Mocking Supabase in integration and E2E tests too. Rejected: it wouldn't test the migration, the RLS policy, or the real PostgREST responses, which are the parts most likely to break.

## Consequences

- Positive: tests can't reach **production data**, even when a developer's `.env.local` points at the shared project.
- Positive: one setup works in all three environments, and `supabase db reset` restores a known state.
- Positive: RLS policies and migrations are tested against a real Postgres.
- Negative: Docker and a running `supabase start` are now required for `npm run test:all`, and CI takes about 1–3 minutes longer.
- Negative: E2E expectations are tied to the **seed data**, so editing the seed can break them. A seed integration test that checks the agreed counts guards against this.
- Follow-up: every future table that tests depend on needs fictional rows in `supabase/seed.sql`.
