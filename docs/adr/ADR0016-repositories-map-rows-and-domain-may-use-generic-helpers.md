# ADR 0016: Repositories Map Supabase Rows to Domain Types; Domain May Use Generic Helpers

- Status: Accepted
- Created: 2026-10-28
- Updated: 2026-10-28
- Supersedes: ADR 0012

## Context

The app is split into domain modules (players, tournaments, auth/access) with a repository seam between the UI and Supabase. An earlier mechanism (ADR 0003's refinement) had a domain-agnostic `client-api` that returned raw rows, with each domain module owning a mapper that declared its own copy of the row shape. When the **player overview** (issue #58) added the first mapper, `toPlayer`, that had three costs:

- `domain` held database column names (`first_name`, `surname_prefix`) in its row type and in a snake_case Zod schema. Persistence vocabulary had leaked into the layer meant to know nothing about storage.
- The mapper's row type duplicated the generated `database.types.ts` row by hand.
- Tournaments will show **players**. A mapper moved into `features/players/api` instead would be unreachable from `features/tournaments/api`, because features can't import each other.

ADR 0012 fixed this with repositories that depend on the domain, and also ruled that `domain` imports nothing else from `src/`. That second rule collided with ADR 0010, which puts generic helpers with no business meaning in `src/lib/` so other tables can reuse them. The "one value or all" filter helpers (`all`, `OrAll`, `matchesFilter`, and the Zod helper `orAll`) are such helpers, but the domain's pure query function `queryPlayers` uses them, so under ADR 0012 they had to stay in the players domain module, where no other domain module can reach them.

## Decision

Repositories map Supabase rows to domain types and validate them with domain schemas. Features receive domain types from repositories and never see rows. The domain may use generic, framework-free helpers from `src/lib/`.

- Keep the domain modules: players, tournaments, auth/access.
- `src/repositories/` holds the Supabase client, the generated `database.types.ts`, and one repository per domain module (for example `repositories/players/fetchPlayers`). It is the only folder allowed to import `@supabase/supabase-js`.
- A repository selects explicit columns, maps each generated row to a domain type, and validates it with that type's Zod schema from `domain`, for example `toPlayer(row)` with `playerSchema`. It returns domain types and throws on a Supabase error or a row that fails validation.
- `domain` owns the domain types and the Zod schemas they are inferred from (`playerSchema` → `Player`), plus the business rules. It knows nothing about storage: no row shapes, no column names.
- `domain` may import `domain` and `lib`, and nothing else from `src/`. It may not import `lib` modules tied to a framework or the browser: `lib/sentry` (the Sentry client) and `lib/utils` (`cn()` for class names). A helper that `domain` uses must stay pure: no React, TanStack, i18next, Supabase or `fetch`.
- `repositories` may import `domain` and `lib`. `domain` may not import `repositories`.
- Each feature's `api/` subfolder (its TanStack Query hooks) is the only part of a feature allowed to import `repositories`. It owns query keys, caching, and retries. Components and stores never import `repositories` or `@supabase/supabase-js`.
- `eslint-plugin-boundaries` and `no-restricted-imports` enforce these rules (`docs/standards/project-structure-standard.md`).

## Alternatives Considered

- Keep generic helpers that the domain uses inside a domain module. Rejected: another domain module (for example tournaments) can't reuse them without importing a sibling module's internals, and they contradict ADR 0010's home for generic helpers.
- Put them in `src/domain/shared/`. Rejected: that folder is for cross-domain business primitives, and these helpers carry no business meaning. Features and `ui` could also not share them through `domain` without depending on it for non-domain code.
- A domain-agnostic `client-api` returning raw rows, with each mapper in `domain` declaring its own row shape. Rejected: it puts column names in the domain and duplicates the generated row type. It also kept `client-api` swappable without touching mappers, but a backend change rewrites the queries anyway, so little was saved.
- Map in each feature's `api/` hook, typed against `database.types.ts`. Rejected: features can't import other features, so another feature needing the same domain type would have to copy the mapping.
- A separate top-level `service/` layer between features and repositories. Rejected: for read-mostly data it would hold pass-through functions only.

## Consequences

- Positive: the domain is free of storage details and is the single source for each type and its validation rules.
- Positive: a renamed column fails typechecking at the query that selects it. A value the generated types can't narrow, such as a `text` nationality, fails at parse time and surfaces as the query's error state, not as a partial list.
- Positive: any feature's `api/` can reuse a repository, so a domain type is mapped in one place.
- Positive: generic helpers have one home, `src/lib/`, whoever uses them.
- Negative: `repositories` depend on `domain`. Replacing Supabase means rewriting the mappers together with the queries.
- Negative: `domain` now depends on `lib`. A `lib` module that later pulls in a framework would leak it into the domain unless it is added to the domain's import ban.
- Negative: a feature's `api/` hook can be a thin `useQuery` wrapper around one repository call. It still earns its place by owning the query key, which the shared `QueryCache.onError` uses to correlate failures (`docs/standards/observability-standard.md`).
- Follow-up: a write path, such as for tournaments, follows the same rule in reverse: the repository takes a domain type and maps it to an insert or update row.

## Notes

- ADR 0007's note that it doesn't change "the domain boundaries decided in ADR 0003" still holds: this ADR changes the mechanism behind the seam and what the domain may depend on, not the domain modules.
