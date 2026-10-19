## 1. Prefactoring: publishable key

- [x] 1.1 Rename `VITE_SUPABASE_ANON_KEY` to `VITE_SUPABASE_PUBLISHABLE_KEY` in `src/client-api/supabaseClient.ts` (keeping the fail-fast error, renamed), `src/vite-env.d.ts`, and `.env.example` (D10)
- [x] 1.2 Change "anon key" to "publishable key" in `docs/standards/security.md` and `docs/standards/observability.md`, and list the required Vercel variables, including keeping `VITE_SUPABASE_ANON_KEY` until the new build is live, in `docs/guides/deployment.md`
- [x] 1.3 Verify: `npm run typecheck`, `npm run build`, and the existing E2E suite pass with a local `.env.local` that sets the new variable

## 2. Prefactoring: test infrastructure for a local Supabase

- [x] 2.1 Write the testing standard `docs/standards/testing.md` (**mock data** for unit tests, **seed data** for integration and E2E tests, interception only for states the seed can't produce, no **production data**, one localhost-only connection helper, fictional data only) and add a "Testing" entry under Standards in `AGENTS.md`; also make the Definition of Done check tests against it
- [x] 2.2 Write failing unit tests for `tests/support/localSupabaseEnv.ts`: maps `API_URL` and `PUBLISHABLE_KEY` from `supabase status -o json` to `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, accepts `127.0.0.1` and `localhost`, refuses any other host, and fails with a clear message when Supabase isn't running (mock the CLI call only)
- [x] 2.3 Implement `tests/support/localSupabaseEnv.ts` until 2.2 passes, and make the unit config pick up tests under `tests/support/`
- [x] 2.4 Pass the helper's values to `vitest.integration.config.ts` through `test.env` and to `playwright.config.ts` through `webServer.env`; verify that a `.env.local` pointing at a non-local URL doesn't reach a test run
- [x] 2.5 Make component unit tests possible: include `src/**/*.unit.test.tsx` in `vitest.unit.config.ts` and `vitest.config.ts`, using the `jsdom` environment for those files
- [x] 2.6 Add the `npx supabase start -x studio,imgproxy,storage-api,edge-runtime,logflare,vector,mailpit,realtime` step before the integration tests in `.github/workflows/verification-checks.yml`, and a `supabase:types` npm script (`supabase gen types typescript --local > src/client-api/database.types.ts`)
- [x] 2.7 Update `docs/guides/e2e-tests.md`: Docker and `supabase start` are required before integration and E2E tests on macOS, in the dev container, and in CI; how the tests get the local URL and publishable key; `supabase db reset` restores the **seed data**; CI starts Supabase itself
- [x] 2.8 Verify: with Supabase stopped, `npm run test:integration` fails fast with the helper's message; with it started, `npm run test:all` passes

## 3. Prefactoring: shared flags and UI primitives

- [x] 3.1 Move the flag map from `src/localization/language-selection/LanguageOption.tsx` to `src/localization/flags.ts` and add a shared `Flag` image component next to it; the existing language-selection unit and E2E tests stay green unchanged
- [x] 3.2 Add the Shadcn `table`, `tooltip`, and `pagination` primitives to `src/ui/`, checking them against `docs/standards/design-system.md` (DESIGN.md tokens, no dark mode)

## 4. Slice: list players in a table (schema → API → UI)

- [x] 4.1 Write failing integration tests: `supabase/seed.sql` holds exactly 100 **players**, 40 female, 24 CZ, 4 HU, and no female GB, covering all six **nationalities**, both **sexes**, a **surname prefix**, a jr./sr. pair, the surnames the spec scenarios name, and shared surnames (`seed.integration.test.ts`)
- [x] 4.2 Write failing integration tests for access: with the publishable key, a `select` returns the **players**; insert, update, and delete are each refused, and the row count and a sample row are unchanged afterwards
- [x] 4.3 Write the migration `supabase/migrations/<timestamp>_create_players.sql` per D1 and D2: `player_sex` enum, `players` columns, the `nationality` check, the non-blank checks, the `nulls not distinct` natural unique key, RLS enabled, one `select` policy for `anon` and `authenticated`, and revoked insert/update/delete/truncate grants
- [x] 4.4 Write `supabase/seed.sql` with 100 fictional **players**, run `supabase db reset`, and confirm 4.1 and 4.2 pass
- [x] 4.5 Regenerate `src/client-api/database.types.ts` with `npm run supabase:types`
- [x] 4.6 Write failing unit tests with **mock data** for `toPlayer(row)` (maps every field, `null` prefix and suffix become absent, rejects an unknown **nationality** or **sex**) and `formatSurname(player)` (`[prefix] surname [suffix]`, leaving out missing parts)
- [x] 4.7 Implement `Player`, `Nationality`, `Sex`, the Zod row schema, `toPlayer`, and `formatSurname` in `src/domain/players/` until 4.6 passes
- [x] 4.8 Write a failing integration test for `fetchPlayerRows()` against the **seed data** (explicit columns, 100 rows, throws on a Supabase error), then implement it in `src/client-api/players/` with a comment on the PostgREST `max_rows` limit
- [x] 4.9 Write a failing integration test for `usePlayers()` in `src/features/players/api/` (query key `['players']`, returns 100 mapped **players**), then implement it
- [x] 4.10 Write failing E2E tests in `tests/e2e/players/` for the scenarios "Players shown with surname, first name, and nationality", "Surname shown with its prefix and suffix", "Table kept on a phone", "Anonymous visitor reads players", and "Visitor cannot change player data" (insert, update, and delete through Playwright's `request` against the local PostgREST with the publishable key, then the overview still lists the same **players**)
- [x] 4.11 Replace the placeholder in `src/routes/players/index.tsx` with a `PlayerOverview` component in `src/features/players/components/` that renders the table (visually hidden caption, Surname, First name, and Nationality columns, a fixed narrow Nationality column, wrapping cells), with the heading, caption, and column headers translated in all six locale files, until 4.10 passes

## 5. Slice: nationality flags with localized country names

- [x] 5.1 Write failing E2E tests for "Flag named in the current UI language" and "Tooltip shows the country name" (hover and keyboard focus)
- [x] 5.2 Add `countries.CZ|DE|HU|PL|NL|GB` to all six locale files
- [x] 5.3 Render each Nationality cell as a tooltip trigger around `Flag` with `role="img"`, an `aria-label` set to the localized country name, and `tabIndex={0}`, until 5.1 passes

## 6. Slice: loading, error, and empty states

- [x] 6.1 Write failing component unit tests with **mock data** and a fresh `QueryClient` (`retry: false`): skeleton while pending, error message with Retry that calls `refetch()`, and "No players yet" with no pagination for an empty list
- [x] 6.2 Write failing E2E tests for "Loading", "Fetching fails" (intercept `**/rest/v1/players*` with a 500 and assert the failure reaches the existing Sentry reporting, using a longer timeout for the default retries), "Retry after a failure" (500, then pass-through), and "No players exist" (intercept with `[]`)
- [x] 6.3 Implement the states in `PlayerOverview` with their texts in all six locale files until 6.1 and 6.2 pass; add no component-level error reporting, relying on `QueryCache.onError` per `docs/standards/observability.md`

## 7. Slice: sort by surname, with the direction in the URL

- [x] 7.1 Write failing unit tests with **mock data** for the sort in `queryPlayers(players, view, locale)`: ascending by default; ignores the **surname prefix**; ignores case; follows the locale (`cs` puts "Horák" before "Chládek", `en` the reverse); breaks ties by first name, then by **surname suffix** with no suffix first; `desc` reverses every key
- [x] 7.2 Write failing unit tests for `playerOverviewSearchSchema` with only `sort`: `asc` by default and an unknown direction falls back to `asc`
- [x] 7.3 Implement the sort part of `queryPlayers` (an `Intl.Collator` with `sensitivity: 'accent'`) and the `sort` field of the search schema in `src/domain/players/` until 7.1 and 7.2 pass
- [x] 7.4 Write failing E2E tests for every scenario of "Players are sorted by surname" and "Surname column header toggles and announces the sort direction", and the "an unknown sort direction" example of "Invalid URL values fall back to the defaults"
- [x] 7.5 Wire `validateSearch` and `stripSearchParams(defaults)` into the route, and add the Surname header `<button>` inside the `<th>` with `aria-sort` and a lucide direction icon; re-sort with `useMemo` keyed on the players, the search, and `i18n.language`, until 7.4 passes

## 8. Slice: filter by nationality

- [x] 8.1 Write failing unit tests with **mock data** for the **nationality** filter in `queryPlayers` (`'all'` lets everything through) and for `presentNationalities(players)`, plus schema tests for `nationality` (`all` by default, an unknown code falls back to `all`)
- [x] 8.2 Implement them in `src/domain/players/` until 8.1 passes
- [x] 8.3 Write failing E2E tests for every scenario of "Visitor can filter players by nationality" and the "an unknown nationality code" example; for "Only nationalities present among players are offered", intercept the response with CZ and NL **players** only, because the **seed data** has all six
- [x] 8.4 Add the **nationality** select above the table ("All" first, then flag plus localized country name sorted with the same collator) writing `nationality` to the URL, with its label in all six locale files, until 8.3 passes

## 9. Slice: filter by sex, combined filters, and the no-match state

- [ ] 9.1 Write failing unit tests with **mock data** for the **sex** filter and for AND with **nationality** in `queryPlayers`, plus schema tests for `sex` (`all` by default, an unknown value falls back to `all`)
- [ ] 9.2 Implement them in `src/domain/players/` until 9.1 passes
- [ ] 9.3 Write failing component unit tests for "No players match the selected filters" with Clear filters, which resets **nationality** and **sex** and keeps the sort
- [ ] 9.4 Write failing E2E tests for every scenario of "Visitor can filter players by sex" and "Filters combine and adapt to narrow screens", for "No players match the filters" and "Clearing filters from the no-match state", for "Reload keeps the view" and "Default view has a clean URL", and for the "an unknown sex" example
- [ ] 9.5 Add the **sex** select (All, Male, Female, labelled via `players.sex.*` in all six locale files), the `flex-col tablet:flex-row` filter layout, and the no-match state with Clear filters, until 9.3 and 9.4 pass

## 10. Slice: pagination with page links on wide screens

- [ ] 10.1 Write failing unit tests for `pageRange(current, count)` in `src/lib/`: the spec examples `1 2 … 10`, `1 … 9 10`, `1 … 4 5 6 … 10`, and `1 2 3 4`, plus a single page and a one-page gap at either end
- [ ] 10.2 Implement `pageRange` until 10.1 passes
- [ ] 10.3 Write failing unit tests with **mock data** for slicing in `queryPlayers` (`{ rows, total, page, pageCount }`, `pageCount = max(1, ceil(total / pageSize))`, a `page` beyond `pageCount` becomes 1) and schema tests for `page` (positive int, default 1, `abc` falls back to 1) and `pageSize` (10, 25, or 50, default 25, `7` falls back to 25)
- [ ] 10.4 Implement slicing and the `page` and `pageSize` schema fields until 10.3 passes
- [ ] 10.5 Write failing E2E tests at 1280px for every scenario of "Player overview is paginated with a visitor-chosen page size", "Page links show a compact page range on wide screens", and "Pagination hides what does not apply"; for every example of "View change resets the page"; for "Back and forward walk through views" and "Shared link opens the same view"; and for the `pageSize=7`, `page=abc`, and `page=9` examples (asserting that the URL is then replaced without `page`)
- [ ] 10.6 Add the pagination below the table: "Players per page" selector, the "Showing X–Y of Z" summary, and numbered TanStack Router `<Link>`s with `aria-current="page"` and Previous/Next rendered as `aria-disabled="true"` at the ends; hide the page links for one page and all pagination for no results; make every view change drop `page` in one `navigate` call; replace an out-of-range `page` after the data loads; translate all texts in six locale files; continue until 10.5 passes

## 11. Slice: compact pagination and orientation after a page change

- [ ] 11.1 Write failing E2E tests for "Compact pagination on a phone" at 375px and for "Moving to the next page" (top of the table in view, focus on the caption, summary in the polite live region)
- [ ] 11.2 Render the compact "Previous · Page N of M · Next" variant and the stacked summary and selector below `tablet`, switching both variants with `hidden tablet:flex` and its inverse
- [ ] 11.3 Add the effect keyed on `page` (skipped on first render) that scrolls the table into view and focuses the `tabIndex={-1}` caption, and the visually hidden `aria-live="polite"` region updated only on page changes, until 11.1 passes

## 12. Slice: translation coverage

- [ ] 12.1 Write the failing E2E Scenario Outline "Page text follows the UI language" for English, Czech, German, Polish, Dutch, and Hungarian (column headers, filter labels, pagination)
- [ ] 12.2 Fill any missing or untranslated keys until 12.1 and the locale parity check in `src/localization/locales/resources.integration.test.ts` pass

## 13. Production data handoff

- [ ] 13.1 Write the idempotent **production data** script in the gitignored `supabase/data/` from `supabase/data/players-ranking-2026-04.md`: 84 **players** in one transaction, `insert … on conflict (natural key) do update set sex = excluded.sex`, with the three spelling fixes, the corrected **nationality**, split **surname prefixes** and **surname suffixes**, and the confirmed **sex**; confirm with `git status` that nothing under `supabase/data/` is tracked, and never run it against a local or CI database
- [ ] 13.2 Hand the migration plan in `design.md` to the product owner: set `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel, apply the migration, run the script, and check for 84 rows and a working anonymous `select`, all before the merge

## 14. Verification

- [ ] 14.1 Check that every scenario in `specs/players/player-overview/spec.md` is covered by an E2E test, and that no test uses `toHaveScreenshot`, `it.skip`, or **production data**
- [ ] 14.2 Run `npx openspec validate create-overview-of-ricochet-players --type change --strict`
- [ ] 14.3 Run the Definition of Done from `AGENTS.md`, including the new testing standard and ADR 0010 and ADR 0011
