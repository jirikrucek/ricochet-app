## 1. Prefactoring: the shared media query and the Popover primitive

- [x] 1.1 Write a failing unit test for `tabletMediaQuery()` and `useIsTablet()` in `src/shared/ui/`: the query reads the `--breakpoint-tablet` token, and the hook follows `matchMedia` changes. Add a reusable `matchMedia` stub for unit tests where the test setup lives, since jsdom has none.
- [x] 1.2 Add `tabletMediaQuery()` and `useIsTablet()` to `src/shared/ui/` and make 1.1 pass.
- [x] 1.3 Make `TopNav` import `tabletMediaQuery()` in place of its private copy, keeping its own close-on-change listener. Verify the existing `TopNav` behaviour tests, and the e2e specs for the mobile menu under `tests/e2e/app/`, still pass.
- [x] 1.4 Add `src/ui/popover.tsx` with `npx shadcn@latest add popover` (style `base-nova`), then replace numeric spacing and `text-xs`/`text-sm` with the nearest design tokens, as the design system standard requires. Verify `npm run design:lint` and `npm run lint` pass.
- [x] 1.5 Run `/code-health` on the work so far and fix its critical findings.

## 2. Slice: open the filters panel as a popover, choose, and Apply (wide screens)

- [x] 2.1 Update the e2e helpers in `tests/e2e/players/overview.ts` first: `chooseFilter` opens the **filters panel**, picks the option, and activates Apply, and `filterSelect` finds the select inside the panel. Delete the e2e test "Filters stack on a phone", which has no successor. Confirm the specs that use the helpers now fail.
- [x] 2.2 Write failing e2e tests at a 1000px viewport for the requirements "Filters are chosen in a filters panel", "Apply commits the filter draft", "Filters panel is a popover on wide screens" and "Filters combine with AND": filters stay out of the way until asked for, choosing options does not apply them, Apply applies the draft and collapses the panel, closing without Apply discards the draft, the popover on a wide screen, the popover closes on an outside click, and both filters applied together. Include "Opening the panel does not move the table" for the popover.
- [x] 2.3 Update the e2e tests for the modified nationality and sex requirements in `nationality-filter.spec.ts` and `sex-filter.spec.ts`: filtering by one nationality, only nationalities present among players are offered, returning to all nationalities, filtering by sex, and sex labels following the UI language, all through the panel and Apply.
- [x] 2.4 Write failing unit tests for the generic filters pieces: the **filter draft** (choose, Apply commits, close discards, reopening starts from the applied values), the count on the **filters button**, and the form's `method`, `action` and control `name` attributes.
- [x] 2.5 Add `playerFiltersSchema`, the nationality and sex fields picked from the search schema, to `domain/types/playerOverviewSearch.ts`, with a unit test.
- [x] 2.6 Build the generic `ui/list-filters/` component with `ListFilters`, `FiltersForm` (React Hook Form with a Zod schema supplied by the caller) and `FilterField`, using the Popover. Add the strings it needs under `listFilters.*` in all six locale files.
- [x] 2.7 Rewrite `ui/PlayerFilters.tsx` to declare the nationality and sex **filters** (labels, options with flags, chip labels) for `ListFilters`. Remove `NationalityFilter`, `SexFilter` and `FilterSelect`.
- [x] 2.8 Wire `PlayerOverview.tsx` to pass the applied values and `changeView` to `PlayerFilters`, so Apply is one navigation that returns to page 1 as one history entry.
- [x] 2.9 Make the tests from 2.1 to 2.4 pass, and fix the other unit and e2e tests that assumed always-visible selects, apart from the "Clear filters" ones, which belong to the next slice. Verify `npm run test:all` passes except those.
- [x] 2.10 Run `/code-health` on the work so far and fix its critical findings.

## 3. Slice: applied filters as chips, and Clear all filters

- [x] 3.1 Write failing e2e tests at 1000px for the requirements "Applied filters are shown beside the filters button" and "Clear all filters removes every applied filter at once": no filter applied, applied filters visible with the panel closed, removing one applied filter, Clear all filters offered with one applied filter, not shown without applied filters, and clearing all applied filters.
- [x] 3.2 Update the e2e tests for the modified requirements in `sex-filter.spec.ts`, `pagination.spec.ts` and `states.spec.ts`: "No players match the filters" shows the chips and Clear all filters, "Clearing filters from the no-match state" uses Clear all filters, every row of the "View change resets the page" examples, "Applying two filters is one history step", and "Default view has a clean URL" through the chip.
- [x] 3.3 Write failing unit tests for the chips: the nationality chip shows the flag and the country name, a chip is a link whose `href` keeps the other search params and drops `page`, Clear all filters appears whenever at least one **filter** is applied, and nothing is shown with none applied.
- [x] 3.4 Build `AppliedFilterChips` and the Clear all filters link in `ui/list-filters/`, taking the link from a `chipLink` prop. Make `PlayerFilters` supply it with the router `Link`, as `PlayerPagination` does.
- [x] 3.5 Remove the "Clear filters" button from the no-match message in `PlayerOverview.tsx`. In `PlayerOverview.unit.test.tsx`, replace the two "Clear filters" tests with Clear all filters equivalents.
- [x] 3.6 Add the new strings (Applied filters, Remove filter: {{name}}, Clear all filters) in all six locale files.
- [x] 3.7 Make the tests from 3.1 to 3.3 pass and verify the whole suite still passes.
- [x] 3.8 Run `/code-health` on the work so far and fix its critical findings.

## 4. Slice: focus return, announcement and keyboard use

- [ ] 4.1 Write failing e2e tests at 1000px for "Filter changes keep the visitor oriented" and "Filters panel can be used with a keyboard": applying filters announces the result, removing a chip announces the result, a no-match result is announced, applying without a change announces the current result, opening with the keyboard reports the button as expanded, and Escape closes the panel and returns focus to the Filters button. Each focus check also asserts that focus is not on `<body>`.
- [ ] 4.2 Write failing unit tests for `useFilterAnnouncement`: nothing is announced until the new rows are shown (`isShowingPreviousPage` is false), a no-change action announces immediately, a zero total announces the no-match message, and a URL change that is not a user action announces nothing. Keep the existing test "does not treat a filter change as a page change" passing.
- [ ] 4.3 Implement `useFilterAnnouncement` and its `role="status"` region in `ui/list-filters/`, with `resultText` and `isShowingPreviousPage` passed down from `PlayerOverview.tsx`.
- [ ] 4.4 Return focus to the **filters button** through a ref when a chip or Clear all filters is used, and verify the popover returns focus itself on Apply and Escape.
- [ ] 4.5 Make the tests from 4.1 and 4.2 pass.
- [ ] 4.6 Run `/code-health` on the work so far and fix its critical findings.

## 5. Slice: the sheet on narrow screens

- [ ] 5.1 Write failing e2e tests at 375px and across the breakpoint for "Filters panel is a sheet on narrow screens", "Filters panel adapts when the viewport changes" and the remaining keyboard scenario: the sheet on a phone with no horizontal scroll, opening the panel does not move the table, crossing the breakpoint closes the panel and discards the draft, and Tab stays inside the sheet. Press Tab with a short pause between keystrokes, because back-to-back synthetic keypresses outrun the dialog's focus guard.
- [ ] 5.2 Write failing unit tests that the overlay is keyed by `useIsTablet()` so a change remounts it closed, and that the sheet opens from the bottom with `max-h-svh` and scrolling.
- [ ] 5.3 Make `ListFilters` choose between the Popover and `Sheet` with `side="bottom"` through `useIsTablet()`, keyed by the result, with no arbitrary values.
- [ ] 5.4 Extend the existing e2e specs that run at phone width, such as `pagination-phone.spec.ts`, so the filters work through the sheet there too.
- [ ] 5.5 Make the tests from 5.1 and 5.2 pass.
- [ ] 5.6 Run `/code-health` on the work so far and fix its critical findings.

## 6. Slice: translations

- [ ] 6.1 Write failing e2e tests for "Filters panel text follows the UI language" and for the Filters button in "Page text follows the UI language", for each of the six languages. Confirm the locale key-parity integration test fails when a key is missing.
- [ ] 6.2 Complete every `listFilters.*` and changed `players.filters.*` string in all six languages. Mark the non-English translations in the pull request for the owner's review before merge.
- [ ] 6.3 Make the tests from 6.1 pass.
- [ ] 6.4 Run `/code-health` on the work so far and fix its critical findings.

## 7. Verify and finish

- [ ] 7.1 Check every scenario in `specs/players/player-overview/spec.md` is covered by an e2e test, and list any gap in the pull request. Run `openspec validate collapsible-list-filters --type change --strict` and fix any error.
- [ ] 7.2 Check `docs/standards/list-filters-standard.md` and ADRs 0021 and 0022 still describe what was built, and update them in place if the built behaviour differs in wording only. If a decision changed, stop and ask the owner.
- [ ] 7.3 Do the real-device check on iOS Safari and Android Chrome: the sheet, where the select's list opens near its bottom edge, the browser toolbars, Clear all filters in the no-match state, and a screen reader pass. Record the outcome in the pull request, and fall back to native pickers on mobile only if it fails.
- [ ] 7.4 Run `/production-readiness` and fix its critical findings.
- [ ] 7.5 Run the Definition of Done from `AGENTS.md`: standards, ADRs, `npm run typecheck`, `npm run lint`, `npm run spec:validate`, `npm run design:lint`, `npm run build`, `npm run test:all`, and the final report.
