## Why

The testing standard makes every spec scenario have an E2E test, but not the other way round: 17 E2E tests cover no scenario, so the specs leave out behaviour the suite protects. For example, nothing in the specs says that choosing a language on a wide screen translates the app. The specs should describe everything the E2E suite protects, so that the app's behaviour can be rebuilt from them if the code is lost. The rule should be enforced, or the specs will fall behind again.

## What Changes

- Every E2E test covers a scenario in force, except an **internals test**. An **internals test** lives in `tests/e2e/internals/`, checks how the app or its test setup is built rather than what a **visitor** sees, and starts with a comment saying why no scenario covers it. If it guards a bug, the comment links the bug's issue.
- `npm run spec:coverage` checks both directions: scenarios without a test, and E2E tests outside `tests/e2e/internals/` that cover no scenario. It prints both lists and fails if either is non-empty. A change that removes a requirement must then delete its tests.
- `npm run spec:coverage` no longer crashes on an active change that has no `proposal.md` yet. Such a change has no delta specs to apply.
- The testing standard's **Spec scenarios** section states the rule, its reason, and what may be an **internals test**.
- `tests/e2e/fixtures.spec.ts` moves to `tests/e2e/internals/`. The three `Sheet` width tests from #92 move to `tests/e2e/internals/sheet.spec.ts`.
- Four tests that repeat an existing scenario on a phone fold into that scenario's test, and their separate tests are deleted. Those scenarios are "Opening the panel does not move the table", "Closing without Apply discards the draft", "View change resets the page" (applies filters), and "Removing one applied filter".
- Two duplicates are deleted. `tests/e2e/app/routes.spec.ts` checks two headings that other tests already check. "Close is named in the UI language" checks the **sheet**'s close control in German, which the translation tests already check in every language.
- The remaining tests get new or changed scenarios, listed under Capabilities, and are retitled to match them.
- The glossary gains **internals test**.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app/language-selection`: a new requirement that choosing a language in the selector translates the interface.
- `app/navigation`: an open menu closes when the viewport widens to 744px or more, and a language chosen in the menu is still the language shown by the wide-screen selector after the viewport widens.
- `players/player-overview`:
  - The page does not scroll horizontally on a phone with the **filters panel** open or closed.
  - A long surname with no break opportunity does not widen the page.
  - A change of the view that returns to page 1 is not announced as a page change.

## Impact

- **Tests:** `tests/e2e/app/` (`language-selection`, `navigation`, `routes`, and the `shell.ts` helpers), `tests/e2e/players/` (`filters-panel`, `filters-sheet`, `filter-orientation`, `listing`, `pagination`, `pagination-phone`, `applied-filters`, and the `overview.ts` helpers), and `tests/e2e/fixtures.spec.ts`. They move, merge, are retitled, or are deleted.
- **Tooling:** `tests/support/checkScenarioCoverage.ts`, `tests/support/scenarioCoverage.ts`, and its unit tests.
- **Docs:** `docs/standards/testing-standard.md`, `docs/standards/project-structure-standard.md`, `docs/guides/testing-guide.md`, `glossary/technical.md`, and the three specs above.
- **App code:** none. Every new scenario describes behaviour the app already has and an existing test already checks.
- **Dependencies:** none.

## Out of Scope

- Behaviour that no E2E test checks today, including behaviour checked only by unit or integration tests. This change brings the specs up to the E2E suite, not up to the whole app.
- Keeping the chosen language after a reload. No test checks it.
- Specs for the placeholder home page and the placeholder Tournaments page.
- Making the check require the bug link in an **internals test**. Review enforces it.
- Tracing unit and integration tests to scenarios.

## Traceability

- Issue: [#98, Trace every E2E test to a spec scenario](https://github.com/jirikrucek/ricochet-app/issues/98)
- Decisions: [comment on #98](https://github.com/jirikrucek/ricochet-app/issues/98#issuecomment-6721069560). The folder is `tests/e2e/internals/` instead of the comment's `tests/e2e/regression/` and exempt `fixtures.spec.ts` path, as agreed in the grilling for this proposal.
- Related: [#95](https://github.com/jirikrucek/ricochet-app/issues/95), the retro that added the scenario-to-test rule, and [#92](https://github.com/jirikrucek/ricochet-app/issues/92), the `Sheet` width bug.
