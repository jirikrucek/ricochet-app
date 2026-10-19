## Why

The app has a Players section in its nav, but the page behind it only shows a heading. **Visitors** can't see who plays Ricochet. The current international ranking list (04/2026) names 84 **players** from six countries. Showing them on a **player overview**, with sorting by surname and filtering by **nationality** and **sex**, is the first piece of real content in the Players section.

## What Changes

- Add a migration creating a Supabase `players` table that holds, per **player**: first name, surname, an optional **surname prefix** ("de", "van", "ter"), an optional **surname suffix** ("jr.", "sr."), **nationality** as an ISO 3166-1 alpha-2 code (CZ, DE, HU, PL, NL, GB), and **sex** (male or female).
- Enable RLS on the table in the same migration, with a single `select` policy for every **visitor** (`anon` and `authenticated`). There are no insert, update, or delete policies, so nobody can write players.
- Add **seed data** in `supabase/seed.sql`: about 16 fictional **players** chosen so every listing, sorting, and filtering rule can be tested. They include a **surname prefix** that changes the sort position when ignored, a jr./sr. pair with the same surname and first name, diacritics that sort differently by language, shared surnames, both **sexes**, and all six **nationalities**.
- Load the 84 real **players** as **production data**. The product owner runs an idempotent SQL script by hand against the shared preview/production database. The script and its source list are kept outside Git (`supabase/data/` is gitignored). Compared with the ranking list (Surname, Name, Country columns), the source list:
  - fixes three spelling mistakes and one wrong **nationality**,
  - splits particles out into a **surname prefix** and generational markers into a **surname suffix**,
  - adds **sex**, which the ranking list doesn't have, as confirmed by the product owner.
- Replace the placeholder `/players` page with the **player overview**:
  - A table at every viewport width with three columns: Surname (shown as `[prefix] surname [suffix]`), First name, and **Nationality** as a flag only. Each flag has an accessible name and a tooltip with the country name in the current UI language.
  - The Surname column header sorts ascending or descending and shows the direction (`aria-sort`). The default is ascending. Sorting is language-aware and case-insensitive in the current UI language. It ignores the **surname prefix** ("de Vries" files under V), and breaks ties by first name, then **surname suffix** (no suffix first when ascending). Descending reverses every key.
  - Two single-select filters above the table, each with an "All" option, combined with AND: **nationality** (flag plus localized country name, offering only nationalities present in the data) and **sex**. On phones the filters stack.
  - Sort direction and filters live in the URL search params, so a filtered, sorted view can be shared, reloaded, and navigated with back/forward. Invalid values fall back to the defaults.
  - Page states: loading, an error with Retry (reported per the observability standard), "No players yet" when the table is empty, and "No players match the selected filters" with a Clear filters action.
- Add translations for all new UI text, country names, and sex labels in all six supported languages.
- Run tests against a local Supabase: CI starts Supabase in Docker, applies migrations and **seed data**, and passes its URL and anon key to integration and E2E tests. Locally, `supabase start` becomes a prerequisite for `npm run test:all`.

## Capabilities

### New Capabilities

- `players/player-overview`: how a **visitor** sees the **players** on the **player overview**: listing them with surname, first name, and **nationality** flag; sorting by surname; filtering by **nationality** and **sex**; keeping that state in the URL; and the loading, error, and empty states.

### Modified Capabilities

_None._

## Impact

- `supabase/migrations/`: new migration creating `players` with RLS and a public read-only policy (the first migration in the repo). It contains no player rows.
- `supabase/seed.sql`: new file with the fictional **seed data**.
- `supabase/.gitignore`: ignores `supabase/data/`, where the **production data** script lives on the product owner's machine.
- `src/client-api/`: regenerated `database.types.ts` and a new players repository returning raw rows.
- `src/domain/players/`: `Player` type, Zod schemas, the row-to-`Player` mapper, and the surname sort rule.
- `src/features/players/`: the TanStack Query hook (`api/`) and the **player overview** components.
- `src/routes/players/index.tsx`: the **player overview** route with validated search params (`routeTree.gen.ts` changes with it).
- `src/ui/`: possibly a Shadcn `table` and `tooltip` primitive.
- `src/assets/flags/`: the existing CZ, DE, HU, PL, NL, and GB flags are reused for **nationality**; no new flags are needed.
- `src/localization/locales/{en,cs,de,pl,nl,hu}.ts`: new keys for the page, filters, states, country names, and **sex** labels.
- Tests:
  - Unit tests use **mock data** for the mapper, the sort rule, and component states.
  - Integration tests run the repository and hook against the local Supabase **seed data**.
  - Playwright E2E tests cover listing, sorting, filtering, and URL state against the **seed data**. Only the "No players yet" and error scenarios intercept `/rest/v1/players` to return an empty list or a 500.
- `.github/workflows/verification-checks.yml`: a step that starts local Supabase and exports its URL and anon key before the integration and E2E tests (adds roughly 1–3 minutes).
- `docs/guides/e2e-tests.md`: document the local Supabase prerequisite.
- Production: the product owner applies the migration and runs the **production data** script by hand. Previews share the production database, so both steps run once. The migration only adds a table, so it is safe to apply before merging.

## Out of Scope

- Adding, editing, or deleting **players** in the UI, and any write access to the `players` table.
- Rankings, points, tournament results, and every other column of the ranking list except Surname, Name, and Country.
- A **player** detail page.
- Searching **players** by name.
- Authentication and roles.
- Committing **production data** to Git, or loading it into local or CI databases.
- Automating migrations or **production data** loading for preview and production.
- Importing future ranking-list PDFs, or any recurring import.
- Adopting Supabase Branching for preview deployments.
- Multi-select filters, and filtering or sorting by any attribute other than those above.
- Showing **sex** or the country name as a column in the **player overview**.
- Pagination.

## Traceability

- Issue: https://github.com/jirikrucek/ricochet-app/issues/58
