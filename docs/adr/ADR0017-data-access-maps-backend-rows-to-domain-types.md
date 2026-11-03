# ADR 0017: Data Access Maps Backend Rows to Domain Types

- Status: Accepted
- Created: 2026-11-02
- Updated: 2026-11-03
- Supersedes: ADR 0012

## Context

The UI shouldn't depend on how data is stored. Column names are snake_case persistence details, and the generated database types can't narrow every value: `nationality` is plain text in Postgres, while the app allows only a fixed set of codes.

ADR 0012 solved this with a shared `src/repositories/` that mapped and validated rows. That mechanism worked and stays. What changes is where it lives: backend access now belongs to each **module** by default (ADR 0016), and query hooks need a clear place between **features** and the code that calls the backend.

## Decision

All code that talks to the backend lives in `data-access/api/` folders and returns **domain types**, never rows.

- `data-access/` is in the **module** by default, and moves to `src/shared/data-access/` when it becomes **shared code**.
- A query selects explicit columns, maps each row to a **domain type**, and validates it with that type's Zod schema, for example `toPlayer(row)` with `playerSchema`. It throws on a Supabase error or a row that fails validation.
- Row and DTO types stay in `data-access/api/`. `domain/` knows nothing about storage: no row shapes, no column names.
- `src/db/` holds the Supabase client and the generated `database.types.ts`. Only `data-access/api/` folders import it.
- Only `src/db/` and `data-access/api/` folders may import `@supabase/supabase-js`.
- TanStack Query hooks, with their query keys and cache settings, live directly in `data-access/`, so `data-access/api/` uses no React, TanStack or i18next.
- Only **features** reach a **module**'s `data-access/` hooks, and only those hooks reach `data-access/api/`. `ui/` components get data through props.
- `eslint-plugin-boundaries` enforces these rules (`docs/standards/project-structure-standard.md`).

## Alternatives Considered

- Mapping inside a Zod schema with `.transform()`, so one schema describes both the row and the **domain type**. Rejected: it puts column names in the schema that defines the type, and repeats the row shape the generated types already provide.
- Components or **features** calling `data-access/api/` directly. Rejected: each would handle caching, loading and retries itself, and nothing would own the query key that error reporting relies on.
- Query hooks in a `hooks/` folder used by components. Rejected: any component could then reach backend data, and the folder would mix query hooks with hooks that have nothing to do with the backend.
- Query hooks and backend calls in one folder, separated by a `use*` filename rule. Rejected: a rule tied to filenames is more fragile than a folder boundary.
- Backend calls in `src/db/`, out of reach of **features**. Rejected: mapping needs the **module**'s **domain types**, which `src/db/` can't import, and every **module**'s queries would sit in one shared layer again.
- A separate `service/` layer between hooks and `data-access/api/`. Rejected: for read-mostly data it would hold pass-through functions only.
- The Supabase client in `src/lib/supabase`, a common convention. Rejected: `app` can import `lib`, while the client should be open only to `data-access/api/`, and generated database types aren't third-party setup.
- Names for the folders. `repositories/` is less conventional for an SPA, and it would no longer be one shared layer. `src/supabase/` is easily confused with the root `supabase/` folder (migrations, seed).

## Consequences

- Positive: a renamed column fails typechecking at the query that selects it. A value the generated types can't narrow fails at parse time and surfaces as the query's error state, not as a partial list.
- Positive: a `ui/` component can't reach the backend, and a **feature** can't skip its query hook, even by accident, because lint rejects the import.
- Negative: `data-access/` has two layers, so a small **module** still needs a hook and an `api/` subfolder for one query.
- Negative: a hook can be a thin `useQuery` wrapper around one `data-access/api/` call. It still earns its place by owning the query key, which the shared `QueryCache.onError` uses to correlate failures (`docs/standards/observability-standard.md`).
- Negative: `data-access/api/` depends on `domain/`. Replacing Supabase means rewriting the mappers together with the queries.
- Negative: `db` slightly undersells its contents, because Supabase Auth, Realtime and Storage use the same client.
- Follow-up: a write path, such as for tournaments, follows the same rule in reverse: `data-access/api/` takes a **domain type** and maps it to an insert or update row.
