## 1. Prefactoring

- [x] 1.1 Prove in a rolled-back transaction that ICU collations order names the same as `Intl.Collator` (design D1)
- [x] 1.2 Record the decisions: ADR 0019, ADR 0020, the ADR index, ADR 0010's status, ADR 0018's note, the project structure and security standards

## 2. Slice: the backend answers one page

- [x] 2.1 Write the migration: collations, `player_sorted`, `players_sorted`, `player_nationalities`, grants; apply it locally and regenerate the database types
- [x] 2.2 Write failing integration tests for `fetchPlayersPage`: page size, totals, each filter, both combined, every sort rule, Czech versus English, no player on two pages, the out-of-range fallback, and a Supabase error
- [x] 2.3 Write failing integration tests for `fetchPlayerNationalities`, and access tests that the RPC and the view are readable, and the view refuses writes; extend the RLS test to require `security_invoker` on every view
- [x] 2.4 Write failing unit tests for `fetchPlayersPage` with a fake client: a missing count, and both forms of the out-of-range answer
- [x] 2.5 Implement `fetchPlayersPage`, `fetchPlayerNationalities`, their hooks, and `itemsPerPage` in `src/config/pagination.ts`; remove `fetchPlayers` and `usePlayers`

## 3. Slice: the overview shows the backend's page

- [x] 3.1 Write failing unit tests for `PlayerOverview`: states, empty table versus no match, Previous and Next at the ends, canonical page, no skeleton while the next page loads
- [x] 3.2 Connect the feature to the new hooks; keep `useCanonicalPage` and `usePageChangeOrientation` from acting on placeholder data
- [x] 3.3 Remove `queryPlayers`, `matchesFilter`, `presentNationalities` and their tests, moving their rules to the integration tests in 2.2

## 4. Slice: the page size is fixed

- [x] 4.1 Change the E2E specs first: every scenario in the delta spec is covered, with interception for 250 players, and a test that no selector exists and a leftover `pageSize` is ignored
- [x] 4.2 Remove `pageSize` from the search schema, `PlayerPagination`, `isSameViewIgnoringPage`'s test, and the six locale files
- [x] 4.3 Add an E2E test that the browser receives only one page

## 5. Verify

- [x] 5.1 Update the seed comment and the remaining references to the removed code
- [x] 5.2 Run `openspec validate server-side-player-overview-pagination --type change --strict`
- [x] 5.3 Run the Definition of Done checks
