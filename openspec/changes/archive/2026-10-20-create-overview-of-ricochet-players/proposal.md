## Why

The app has a Players section in its nav, but the page behind it only shows a heading. **Visitors** can't see who plays Ricochet. The current international ranking list (04/2026) names 84 **players** from six countries. Showing them on a **player overview**, with sorting by surname, filtering by **nationality** and **sex**, and pagination, is the first piece of real content in the Players section.

## What Changes

- Add a migration creating a Supabase `players` table that holds, per **player**: first name, surname, an optional **surname prefix** ("de", "van", "ter"), an optional **surname suffix** ("jr.", "sr."), **nationality** as an ISO 3166-1 alpha-2 code (CZ, DE, HU, PL, NL, GB), and **sex** (male or female).
- Enable RLS on the table in the same migration, with a single `select` policy for every **visitor** (`anon` and `authenticated`). There are no insert, update, or delete policies, so nobody can write players.
- Add **seed data** in `supabase/seed.sql`: exactly 100 fictional **players** chosen so every listing, sorting, filtering, and pagination rule can be tested, including page links with ellipses. That is 4 pages at the default page size, 10 pages at 10, and 2 pages at 50. Of them, 40 are female, 24 are Czech, 4 are Hungarian, and none is a female British **player**, as the spec scenarios expect. They include a **surname prefix** that changes the sort position when ignored, a jr./sr. pair with the same surname and first name, diacritics that sort differently by language, shared surnames, both **sexes**, and all six **nationalities**.
- Load the 84 real **players** as **production data**. The product owner runs an idempotent SQL script by hand against the shared preview/production database. The script and its source list are kept outside Git (`supabase/data/` is gitignored). Compared with the ranking list (Surname, Name, Country columns), the source list:
  - fixes three spelling mistakes and one wrong **nationality**,
  - splits particles out into a **surname prefix** and generational markers into a **surname suffix**,
  - adds **sex**, which the ranking list doesn't have, as confirmed by the product owner.
- Replace the placeholder `/players` page with the **player overview**:
  - A table at every viewport width with three columns: Surname (shown as `[prefix] surname [suffix]`), First name, and **Nationality** as a flag only. Each flag has an accessible name and a tooltip with the country name in the current UI language.
  - The Surname column header sorts ascending or descending and shows the direction (`aria-sort`). The default is ascending. Sorting is language-aware and case-insensitive in the current UI language. It ignores the **surname prefix** ("de Vries" files under V), and breaks ties by first name, then **surname suffix** (no suffix first when ascending). Descending reverses every key.
  - Two single-select filters above the table, each with an "All" option, combined with AND: **nationality** (flag plus localized country name, offering only nationalities present in the data) and **sex**. On phones the filters stack.
  - Filtering, sorting, and page slicing are one pure domain function in `src/domain/players/`, rendered with Shadcn `table` markup, without a table library. A new ADR records this choice over TanStack Table and the triggers for revisiting it, such as several sortable columns, multi-column sorting, column visibility, row selection, or several complex tables.
  - Client-side pagination: all **players** are fetched once, then filtered, sorted, and sliced in the browser.
    - Below the table: a "Players per page" selector (10 / 25 / 50, default 25), a summary of the filtered results ("Showing 26–50 of 84"), and numbered page links with Previous/Next.
    - On wide screens the links show the first page, the last page, and the current page ±1, with ellipses between them. A gap of only one page shows that page's number instead of an ellipsis. The current page is marked `aria-current="page"`, Previous is disabled on the first page, and Next on the last.
    - Below 744px the links compact to "Previous · Page 2 of 4 · Next", with the summary and page-size selector stacked above.
    - With one page of results, the summary and page-size selector still show but the page links are hidden. With no results, all pagination is hidden.
    - Changing a filter, the sort direction, or the page size, or using Clear filters, returns to page 1.
    - After a page change, the view scrolls to the top of the table, focus moves to the table's caption, and the new summary is announced in a polite live region.
  - Sort direction, filters, page (`page`), and page size (`pageSize`) live in the URL search params, so a view can be shared, reloaded, and navigated with back/forward. Defaults are left out of the URL. Invalid values fall back to the defaults, and a `page` beyond the last page falls back to page 1.
  - Page states: loading, an error with Retry (reported per the observability standard), "No players yet" when the table is empty, and "No players match the selected filters" with a Clear filters action.
- Add translations for all new UI text, country names, and sex labels in all six supported languages.
- Run tests against a local Supabase: CI starts Supabase in Docker, applies migrations and **seed data**, and passes its URL and publishable key to integration and E2E tests. Locally, `supabase start` becomes a prerequisite for `npm run test:all`.
- Add a testing standard (`docs/standards/testing-standard.md`) that sets the data rules for every test level:
  - Unit tests use **mock data** only and never reach Supabase.
  - Integration and E2E tests run against the local Supabase with **seed data**.
  - E2E tests intercept Supabase requests only for states the **seed data** can't produce, such as an empty table or a server error.
  - **Production data** is never used by any test, never committed, and never loaded into local or CI databases.
  - Tests that reach a database get its URL and key from one helper that reads `supabase status`, and that helper refuses any database that isn't on localhost.
  - **Seed data** and **mock data** are fictional.

  `AGENTS.md` gets a pointer to it, and the Definition of Done checks tests against it.
- Update the E2E guide (`docs/guides/e2e-tests-guide.md`). It will say that Docker and a running local Supabase (`supabase start`) are required before integration and E2E tests on macOS, in the dev container, and in CI. It will also cover how the tests get the local URL and publishable key, how to reset to **seed data** (`supabase db reset`), and that CI starts Supabase itself.

## Capabilities

### New Capabilities

- `players/player-overview`: how a **visitor** sees the **players** on the **player overview**: listing them with surname, first name, and **nationality** flag; sorting by surname; filtering by **nationality** and **sex**; paginating with a visitor-chosen page size; keeping that state in the URL; and the loading, error, and empty states.

### Modified Capabilities

_None._

## Impact

- `supabase/migrations/`: new migration creating `players` with RLS and a public read-only policy (the first migration in the repo). It contains no player rows.
- `supabase/seed.sql`: new file with the fictional **seed data**.
- `supabase/.gitignore`: ignores `supabase/data/`, where the **production data** script lives on the product owner's machine.
- `src/repositories/` (renamed from `src/client-api/`): regenerated `database.types.ts` and a new players repository that maps rows to `Player` and validates them with the domain schema.
- `src/domain/players/`: the `Player` schema and type, the nationality and sex schemas, the surname sort rule, and the page-slicing rule.
- `src/features/players/`: the TanStack Query hook (`api/`) and the **player overview** components.
- `src/routes/players/index.tsx`: the **player overview** route with validated search params (`routeTree.gen.ts` changes with it).
- `src/ui/`: possibly Shadcn `table`, `tooltip`, and `pagination` primitives.
- `src/assets/flags/`: the existing CZ, DE, HU, PL, NL, and GB flags are reused for **nationality**; no new flags are needed.
- `src/localization/locales/{en,cs,de,pl,nl,hu}.ts`: new keys for the page, filters, states, country names, and **sex** labels.
- Tests:
  - Unit tests use **mock data** for the mapper, the sort and page-slicing rules, and component states.
  - Integration tests run the repository and hook against the local Supabase **seed data**.
  - Playwright E2E tests cover listing, sorting, filtering, pagination, and URL state against the **seed data**. Only the "No players yet" and error scenarios intercept `/rest/v1/players` to return an empty list or a 500.
- `.github/workflows/verification-checks.yml`: a step that starts local Supabase before the integration and E2E tests, which read its URL and publishable key through the same helper as on a developer machine (adds roughly 1–3 minutes).
- `src/repositories/supabaseClient.ts`, `src/vite-env.d.ts`, `.env.example`: the app switches from the legacy anon key to the publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`). The product owner sets it in Vercel before the merge. `docs/standards/security-standard.md`, `docs/standards/observability-standard.md`, and `docs/guides/deployment-guide.md` are updated to match.
- `docs/standards/project-structure-standard.md` and `eslint.config.mjs`: `routes` may import `domain`, so a route can validate its search params with a domain schema (already updated).
- `docs/adr/ADR0002-adopt-type-safe-frontend-architecture.md`: the line prescribing TanStack Table was removed, with a dated note (already updated).
- `docs/standards/testing-standard.md`: new standard for test data per test level (**mock data**, **seed data**, interception, no **production data**).
- `docs/adr/`: a new ADR deciding against TanStack Table for this table: a plain domain query function and Shadcn `table` markup are used instead, with triggers for revisiting the decision.
- `AGENTS.md`: a "Testing" entry under Standards pointing to `docs/standards/testing-standard.md`.
- `docs/guides/e2e-tests-guide.md`: the local Supabase prerequisite (Docker, `supabase start`, environment variables, `supabase db reset`) for each environment, and how CI starts Supabase.
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
- Server-side pagination, filtering, or sorting (a follow-up if the number of **players** grows into the thousands).
- "Load more" or infinite scroll.
- Adopting TanStack Table, or any other table library. The new ADR records why, and when to reconsider it.

## Traceability

- Issue: https://github.com/jirikrucek/ricochet-app/issues/58
