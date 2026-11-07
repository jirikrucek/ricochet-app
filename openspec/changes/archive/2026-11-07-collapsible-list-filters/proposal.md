## Why

The **player overview** shows its two **filters** as always-visible selects. They take room that grows with every **filter** a list gains, they apply the moment an option is picked, and that gives a screen reader user no clear moment of feedback. Every list the app adds will need **filters**, and each screen should not invent its own. This change picks one pattern now, with the **player overview** as its first user, because it is the only list with **filters** today.

## What Changes

- **BREAKING** The **player overview** no longer shows its **nationality** and **sex** **filters** above the table. A single **filters button** opens a **filters panel** instead, so the requirement that the **filters** stack on a phone goes away, and a **filter** no longer applies when its option is picked.
- The **filters panel** holds one **filter** per attribute and an Apply button. Choosing options builds a **filter draft**, and nothing is applied until the **visitor** clicks Apply. Applying collapses the panel. Closing it any other way discards the **filter draft**.
- The **filters panel** is a **popover** at and above 744px and a **sheet** below it, chosen by viewport width. If the viewport crosses 744px while the panel is open, it closes and the **filter draft** is discarded.
- The **filters button** shows how many **filters** are applied. Each **applied filter** shows as a removable chip beside it, and a single Clear all filters action sits beside the chips whenever at least one is applied. It replaces the Clear filters button of the no-match state, so there is one way and one label for clearing everything.
- After the **visitor** applies filters or removes a chip, focus returns to the **filters button** and a polite live region announces the result, which today only page changes do.
- The markup is native first: a real `<form method="get">` with an `action` and control names equal to the URL search params, and chips that are real links. There is no separate baseline mode. This is not a no-JavaScript guarantee, because the app is a client-rendered SPA.
- A new ADR records the pattern, and a new standard in `docs/standards/` makes it the rule for every list, with its trigger added to `AGENTS.md`.
- The filters component is built generic and props-driven in the players **module**'s `ui/`. It moves to **shared code** when a second **module** needs it, and the standard says so.
- Base UI's Popover is added to `src/ui/` through shadcn, adjusted to the design tokens. The existing **sheet** is used with `side="bottom"`.
- Every new string is translated into all six languages. The non-English translations are marked for the owner's review before merge.
- Unit tests and e2e specs that assume always-visible selects are updated. New e2e coverage runs at two viewport sizes. A real-device check on iOS Safari and Android Chrome is a release gate.

## Capabilities

### New Capabilities

None. The pattern's rules for future lists live in the ADR and the standard, not in a second spec.

### Modified Capabilities

- `players/player-overview`: the requirements for the **nationality** filter, the **sex** filter, and how filters combine and adapt to narrow screens change from always-visible selects to the **filters button**, **filters panel**, **filter draft**, and **applied filter** chips. The requirement for returning to page 1 extends to every filter change, and a new requirement keeps the **visitor** oriented after one. The requirements for the URL and for translations change to match.

## Impact

- **Code:** `src/modules/players/ui/` (new generic filters component, existing filter components reworked), `src/modules/players/features/player-overview/` (wiring, announcement), `src/ui/popover.tsx` (new), `src/shared/ui/` (the 744px media query, now also used by `TopNav`), and `src/locales/` (six languages).
- **Tests:** `PlayerOverview.unit.test.tsx`, the e2e specs `sex-filter`, `translations`, `pagination` and `pagination-phone`, and new unit and e2e coverage.
- **Docs:** a new ADR, a new standard, `AGENTS.md`, the glossary, and the `player-overview` spec.
- **Unchanged:** the URL search params, the backend filtering, and the page size (ADR 0002 and ADR 0020).
- **Dependencies:** none new. `@base-ui/react` is already installed and includes the Popover.

## Out of Scope

- Filter types other than single-select, such as multi-select, date ranges, and text search.
- Moving the component to `src/shared/ui/` now. ADR 0016 stays as it is, and the move happens when a second **module** needs it.
- New **filters** on the **player overview**, a tournaments list, and any change to backend filtering or URL params.
- Fixing the `Sheet` width bug (#92). The bottom **sheet** does not depend on it.
- Support for visitors without JavaScript, and server rendering.

## Traceability

- Issue: [#93, Adopt a collapsible Filters pattern](https://github.com/jirikrucek/ricochet-app/issues/93)
- Related: [#92, Sheet collapses to 8px wide unless its max-width is overridden](https://github.com/jirikrucek/ricochet-app/issues/92)
- Prototype: branch `feature/progressive-player-filters-prototype`, commit `deb87cd`. It is a record of the exploration and is not for `main`.
