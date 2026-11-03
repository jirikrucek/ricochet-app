# ADR 0017: API Folders Map Backend Rows to Domain Types

- Status: Accepted
- Created: 2026-11-02
- Updated: 2026-11-02
- Supersedes: ADR 0012

## Context

The UI shouldn't depend on how data is stored. Column names are snake_case persistence details, and the generated database types can't narrow every value: `nationality` is plain text in Postgres, while the app allows only a fixed set of codes.

ADR 0012 solved this with a shared `src/repositories/` that mapped and validated rows. That mechanism worked and stays. What changes is where it lives: backend access now belongs to each **feature** by default (ADR 0016), and hooks that used to sit in `features/*/api/` meant `api` didn't always mean code that talks to the backend.

## Decision

All code that talks to the backend lives in `api/` folders and returns **domain types**, never rows.

- `api/` is in the **feature** by default, with a **global counterpart** at `src/api/` for code two or more features use.
- A query selects explicit columns, maps each row to a **domain type**, and validates it with that type's Zod schema, for example `toPlayer(row)` with `playerSchema`. It throws on a Supabase error or a row that fails validation.
- Row and DTO types stay in `api/`. `types/` knows nothing about storage: no row shapes, no column names.
- `src/db/` holds the Supabase client and the generated `database.types.ts`. Only `api/` folders import it.
- Only `src/db/` and `api/` folders may import `@supabase/supabase-js`.
- Only hooks reach `api/`. TanStack Query hooks, with their query keys and cache settings, live in `hooks/`, so `api/` uses no React, TanStack or i18next.
- `eslint-plugin-boundaries` enforces these rules (`docs/standards/project-structure-standard.md`).

## Alternatives Considered

- Mapping inside a Zod schema with `.transform()`, so one schema describes both the row and the **domain type**. Rejected: it puts column names in the schema that defines the type, and repeats the row shape the generated types already provide.
- Components calling `api/` directly. Rejected: each component would handle caching, loading and retries itself, and nothing would own the query key that error reporting relies on.
- A separate `service/` layer between hooks and `api/`. Rejected: for read-mostly data it would hold pass-through functions only.
- The Supabase client in `src/lib/supabase`, a common convention. Rejected: `app` and hooks can import parts of `lib`, while the client should be open only to `api/`, and generated database types aren't third-party setup.
- Names for the folders. `repositories/` is less conventional for an SPA, and it would no longer be one shared layer. `src/supabase/` is easily confused with the root `supabase/` folder (migrations, seed).

## Consequences

- Positive: a renamed column fails typechecking at the query that selects it. A value the generated types can't narrow fails at parse time and surfaces as the query's error state, not as a partial list.
- Positive: a component can't reach the backend, even by accident, because lint rejects the import.
- Negative: a hook can be a thin `useQuery` wrapper around one `api/` call. It still earns its place by owning the query key, which the shared `QueryCache.onError` uses to correlate failures (`docs/standards/observability-standard.md`).
- Negative: `api/` depends on `types/`. Replacing Supabase means rewriting the mappers together with the queries.
- Negative: `db` slightly undersells its contents, because Supabase Auth, Realtime and Storage use the same client.
- Follow-up: a write path, such as for tournaments, follows the same rule in reverse: `api/` takes a **domain type** and maps it to an insert or update row.
