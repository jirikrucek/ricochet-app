## 1. Prefactoring: one matching rule, tests with their file, no crash on an early change

- [x] 1.1 Move the existing `uncoveredScenarios` unit tests in `tests/support/scenarioCoverage.unit.test.ts` to tests given as `{ file, titlePath }`, keeping today's matching rule, and confirm they fail.
- [x] 1.2 Change `uncoveredScenarios` in `tests/support/scenarioCoverage.ts` to take `{ file, titlePath }` tests, with its matching rule in a private `covers(scenario, test)`. Make 1.1 pass with no change in which scenarios are reported.
- [x] 1.3 Write a failing unit test for a pure `isProposalDone(status)` helper that reads the JSON of `openspec status --change <name> --json`: true only when the `proposal` artifact is `done`.
- [x] 1.4 Add `isProposalDone`, and make `checkScenarioCoverage.ts` skip an active change whose proposal isn't done before it calls `openspec show`. Make the wrapper keep each test's file (the title of its top-level suite in the Playwright JSON report). Verify with a scratch change that has no `proposal.md`: `npm run spec:coverage` reports the 6 scenarios of this change and doesn't crash. Then delete the scratch change.
- [x] 1.5 Run `/code-health` on this slice alone, with `HEAD` as the fixed point, and fix its critical findings before the slice is committed.

## 2. Slice: the reverse check, failing on today's 27 tests

- [x] 2.1 Write failing unit tests for `testsCoveringNoScenario(scenarios, tests)`: it reports a test that covers no scenario, doesn't report a test that `covers` one (also through an example of an Examples scenario), skips every test whose file starts with `internals/` even if it covers nothing, and doesn't skip a file that only contains `internals` elsewhere in its path. One test gives the same scenarios and tests to both functions and checks that they agree.
- [x] 2.2 Add `testsCoveringNoScenario` and the exported `internals/` prefix constant to `scenarioCoverage.ts`. Make 2.1 pass.
- [x] 2.3 Make `checkScenarioCoverage.ts` print the uncovered scenarios, then the tests that cover no scenario as `file › describe › … › title` under a heading that names `docs/standards/testing-standard.md` and `tests/e2e/internals/`, and exit 1 if either list is non-empty. On success it prints both counts.
- [x] 2.4 Update the **Spec scenarios** section of `docs/standards/testing-standard.md`: every E2E test outside `tests/e2e/internals/` covers a scenario in force, with the reason (the specs describe everything the E2E suite protects) and a link to #98. Say what may be an **internals test** (a test of how the app or its test setup is built, never of what a visitor sees), that each starts with a comment saying why no scenario covers it and links the bug issue it guards, if any, and that `npm run spec:coverage` checks both directions.
- [x] 2.5 Run `npm run spec:coverage`. Confirm it fails and lists the 6 new scenarios and the 27 tests found while planning (17 named in #98 and the 10 in `fixtures.spec.ts`). The next slices burn that list down.
- [x] 2.6 Run `/code-health` on this slice alone, with `HEAD` as the fixed point, and fix its critical findings before the slice is committed.

## 3. Slice: internals tests

- [x] 3.1 Move `tests/e2e/fixtures.spec.ts` to `tests/e2e/internals/fixtures.spec.ts`. Fix its import of the fixture, and add a top-of-file comment saying it tests the page error and Sentry fixture, not the app.
- [x] 3.2 Move the three tests of "Sheet width at the sm breakpoint and wider" from `tests/e2e/app/navigation.spec.ts` to `tests/e2e/internals/sheet.spec.ts`, importing the helpers they need from `tests/e2e/app/shell.ts` or exporting them there. Add a top-of-file comment saying it tests the shared `Sheet` component's width, not product behaviour, and linking #92.
- [x] 3.3 Update the `fixtures.spec.ts` path in `docs/guides/testing-guide.md`. In `docs/standards/project-structure-standard.md`, add `internals/` to the tree under `tests/e2e/`.
- [x] 3.4 Run the moved tests and confirm they pass. Confirm `npm run spec:coverage` no longer lists any of them.
- [x] 3.5 Run `/code-health` on this slice alone, with `HEAD` as the fixed point, and fix its critical findings before the slice is committed.

## 4. Slice: app shell scenarios

- [x] 4.1 In `tests/e2e/app/language-selection.spec.ts`, retitle "changes the app language from the selector" to "Switching to German on a wide screen", inside a describe "Choosing a language translates the interface", at a viewport 1280px wide.
- [x] 4.2 In `tests/e2e/app/navigation.spec.ts`, retitle "Menu closes when the viewport widens to tablet" to "Menu closes when the viewport widens to tablet width", inside the describe "Top nav bar shows the full single-row layout from 744px upward", and widen to 744px, not 1280px. Keep its checks that the overlay is gone and the scroll lock is released.
- [x] 4.3 In `tests/e2e/app/navigation.spec.ts`, retitle "Mobile language selection stays in sync after resizing to desktop" to "Language chosen in the menu stays chosen on a wider screen", inside the describe "Language can be changed from the menu". Keep its switch back to English in the nav bar's selector.
- [x] 4.4 Delete `tests/e2e/app/routes.spec.ts`. First confirm that "Going to Tournaments from the menu" checks the Tournaments `h1`, and that `translations.spec.ts` checks the Players `h1`.
- [x] 4.5 Run the app shell E2E tests and confirm they pass. Confirm `npm run spec:coverage` no longer lists the 3 app shell scenarios or these tests.
- [x] 4.6 Run `/code-health` on this slice alone, with `HEAD` as the fixed point, and fix its critical findings before the slice is committed.

## 5. Slice: player overview scenarios

- [ ] 5.1 Merge each phone repeat into its scenario's existing test, then delete the separate test:
  - "Opening the panel does not move the table on a phone" into "Opening the panel does not move the table"
  - "Close discards the draft" (the **sheet**'s Close button) into "Closing without Apply discards the draft"
  - "Applying a filter in the sheet shows the first page of the result" into "View change resets the page: applies filters"
  - "A chip removes the filter without opening the sheet" into "Removing one applied filter"
- [ ] 5.2 Delete "Close is named in the UI language" from `tests/e2e/players/filters-sheet.spec.ts`. First confirm that each "Filters panel text follows the UI language: <language>, the sheet" test checks the close button.
- [ ] 5.3 In `tests/e2e/players/listing.spec.ts`, retitle "Table kept on a phone with an unbroken long name" to "Table kept on a phone with a long unbroken name".
- [ ] 5.4 In `tests/e2e/players/filters-sheet.spec.ts`, replace the two "The page does not scroll horizontally on …" tests with four tests, one per Examples row: "Page does not scroll horizontally on a phone: 320px, panel closed", then "…: 320px, panel open", "…: 375px, panel closed", and "…: 375px, panel open". Each opens the overview with the nationality Czechia and the sex Female applied.
- [ ] 5.5 In `tests/e2e/players/pagination-phone.spec.ts`, retitle "a filter change does not announce a page change" to "A filter change is not announced as a page change", inside the describe "Page changes keep the visitor oriented". Extend it to check that the filter result "Showing 1–25 of 40" is announced once. Delete the now-empty describe "Filters work through the sheet on a phone" if 5.1 emptied it.
- [ ] 5.6 Run the player overview E2E tests and confirm they pass. Confirm `npm run spec:coverage` passes in both directions.
- [ ] 5.7 Run `/code-health` on this slice alone, with `HEAD` as the fixed point, and fix its critical findings before the slice is committed.

## 6. Wrap-up

- [ ] 6.1 Run `openspec validate trace-e2e-tests-to-spec-scenarios --type change --strict`.
- [ ] 6.2 Run the branch check from `AGENTS.md`.
