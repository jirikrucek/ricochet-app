# ADR 0012: Repositories Map Supabase Rows to Domain Types

- Status: Accepted
- Created: 2026-10-20
- Updated: 2026-10-20
- Supersedes: ADR 0003

## Context

ADR 0003 split the app into domain modules (players, tournaments, auth/access) and put a repository seam between the UI and Supabase. Its 2026-08-11 refinement made `client-api` a domain-agnostic layer that returned raw rows. Each domain module owned a mapper that declared its own copy of the row shape, so `domain` would not import `client-api`'s generated types.

The **player overview** (issue #58) added the first table and the first mapper, `toPlayer`. The refined mechanism had three costs in practice:

- `domain` held database column names (`first_name`, `surname_prefix`) in its row type and in a snake_case Zod schema. Persistence vocabulary had leaked into the layer meant to know nothing about storage.
- The mapper's row type duplicated the generated `database.types.ts` row by hand.
- Tournaments will show **players**. A mapper moved into `features/players/api` instead would be unreachable from `features/tournaments/api`, because features can't import each other.

The direction ADR 0003 rejected, an adapter that depends on the domain, is the usual one for a repository: infrastructure depends on the domain, and the domain depends on nothing.

## Decision

Repositories map Supabase rows to domain types and validate them with domain schemas. Features receive domain types from repositories and never see rows.

- Keep the domain modules from ADR 0003: players, tournaments, auth/access.
- Rename `src/client-api/` to `src/repositories/`. It holds the Supabase client, the generated `database.types.ts`, and one repository per domain module (for example `repositories/players/fetchPlayers`). It is the only folder allowed to import `@supabase/supabase-js`.
- A repository selects explicit columns, maps each generated row to a domain type, and validates it with that type's Zod schema from `domain`, for example `toPlayer(row)` with `playerSchema`. It returns domain types and throws on a Supabase error or a row that fails validation.
- `domain` owns the domain types and the Zod schemas they are inferred from (`playerSchema` → `Player`), plus the business rules. It knows nothing about storage: no row shapes, no column names. It imports nothing else from `src/`.
- `repositories` may import `domain` and `lib`. `domain` may not import `repositories`.
- Each feature's `api/` subfolder (its TanStack Query hooks) is the only part of a feature allowed to import `repositories`. It owns query keys, caching, and retries. Components and stores never import `repositories` or `@supabase/supabase-js`.
- `eslint-plugin-boundaries` enforces these rules (`docs/standards/project-structure-standard.md`).

## Alternatives Considered

- Keep ADR 0003's refined mechanism: a domain-agnostic `client-api` returning raw rows, with each mapper in `domain` declaring its own row shape. Rejected: it puts column names in the domain and duplicates the generated row type. It also kept `client-api` swappable without touching mappers, but a backend change rewrites the queries anyway, so little was saved.
- Map in each feature's `api/` hook, typed against `database.types.ts`. Rejected: features can't import other features, so another feature needing the same domain type would have to copy the mapping.
- A separate top-level `service/` layer between features and repositories. Rejected, as in ADR 0003: for read-mostly data it would hold pass-through functions only.
- Names for the renamed folder. `data/` is too vague, `supabase/` is easily confused with the root `supabase/` folder (migrations, seed), and `backend/` suggests server code in a client-only SPA. `repositories/` matches the repository seam this decision describes.

## Consequences

- Positive: the domain is free of storage details and is the single source for each type and its validation rules.
- Positive: a renamed column fails typechecking at the query that selects it. A value the generated types can't narrow, such as a `text` nationality, fails at parse time and surfaces as the query's error state, not as a partial list.
- Positive: any feature's `api/` can reuse a repository, so a domain type is mapped in one place.
- Negative: `repositories` now depend on `domain`. Replacing Supabase means rewriting the mappers together with the queries.
- Negative: a feature's `api/` hook can be a thin `useQuery` wrapper around one repository call. It still earns its place by owning the query key, which the shared `QueryCache.onError` uses to correlate failures (`docs/standards/observability-standard.md`).
- Follow-up: a write path, such as for tournaments, follows the same rule in reverse: the repository takes a domain type and maps it to an insert or update row.

## Notes

- ADR 0007's note that it doesn't change "the domain boundaries decided in ADR 0003" still holds for this ADR: it changes the mechanism behind the seam, not the domain modules.
