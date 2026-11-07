# List Filters Standard

Every list with at least one **filter** follows this standard. It applies the decisions in [ADR 0021](../adr/ADR0021-lists-show-filters-in-a-collapsible-panel-applied-with-one-button.md) and [ADR 0022](../adr/ADR0022-list-filters-use-native-semantics-first.md). Placement of the code follows the [project structure standard](project-structure-standard.md), and the UI follows the [design system standard](design-system-standard.md).

## What every list does

- **Single-select only.** Other filter types (multi-select, ranges, text search) are not covered yet. Don't improvise one: it needs its own decision.
- **One filters button, one filters panel.** The list shows one **filters button** with a count of the applied **filters**, never the **filters** themselves. The **filters panel** holds one control per **filter** and an Apply button.
- **Apply commits the draft.** Choosing an option changes only the **filter draft**. Apply applies all of it at once and collapses the panel. Escape, an outside click on the **popover**, and Close on the **sheet** discard the draft.
- **Popover from 744px, sheet below.** The choice is by viewport width, using the `tablet` breakpoint token and not a hard-coded width or the pointer type. The **sheet** opens from the bottom. If the viewport crosses the breakpoint while the panel is open, the panel closes and the draft is discarded.
- **Applied filters stay visible.** Each **applied filter** is a chip beside the **filters button**, and one Clear all filters action removes all of them. No list adds a second action for clearing, not even in an empty result.
- **The table never moves** when the panel opens or closes.
- **A filter change returns to page 1** as one history entry, and keeps the sort direction. The view lives in the URL and the filtering happens in the backend ([ADR 0002](../adr/ADR0002-adopt-type-safe-frontend-architecture.md), [ADR 0020](../adr/ADR0020-lists-are-filtered-sorted-and-paged-in-the-backend.md)).

## Build on native semantics

- The panel contains a real `<form method="get">` with an `action`. Each control's `name` equals its URL search param.
- Apply is the form's submit button. React prevents the page load and navigates through the router.
- The **filters button** is a button. Each chip and Clear all filters is a router link with a real `href` that keeps the other search params and drops `page`.
- This is not a guarantee for visitors without JavaScript. The app is a client-rendered SPA, so don't add a separate baseline mode or a flag for one, and don't test the list without JavaScript.

## Accessibility

- After Apply, a chip removal, or Clear all filters, focus returns to the **filters button**. The overlay does this on close. A chip or Clear all filters that disappears does it explicitly.
- The result is announced in a polite live region once the new rows are shown, not when the search changes: the summary, or the no-match message. If the action changes nothing, the current result is announced at once.
- Escape closes the panel and returns focus to the button. The **sheet** keeps Tab inside it. The **popover** is non-modal and never traps focus.
- The button tells assistive technology whether the panel is open.
- The panel stays usable at 200% zoom and from 320px wide without scrolling horizontally.

## Building a list's filters

- Declare the **filters** (name, label, options, chip label) and pass them to the generic `ListFilters` component. Don't hand-build the button, draft, chips, or announcement.
- The component starts in the **module** that owns the first list, in its `ui/`. When a second **module** needs it, move it to `src/shared/ui/` with its translations, as the structure standard says. Don't copy it.
- The **filter draft** is a React Hook Form form validated by a Zod schema derived from the list's search schema, so there is one definition of what a valid view is.
- Generic strings live under `listFilters.*` and per-list labels under that list's own keys. Every string exists in all six languages.
- The overlays come from `src/ui/` (`Popover`, `Sheet`) and are not rebuilt. Don't use an arbitrary value for the sheet's height or spacing: use the design tokens.

## Tests

- Unit tests cover the draft, Apply, discard on close, the chips, Clear all filters, and the announcement. jsdom has no `matchMedia`, so stub it.
- End-to-end tests run at a viewport above and below 744px. They check the **popover** versus the **sheet**, the keyboard flow with focus returning to the button, the announcement, chip removal, and the viewport crossing 744px. They assert roles and attributes, never pixels ([ADR 0009](../adr/ADR0009-e2e-tests-do-not-use-pixel-snapshots.md)).
- Changing the **sheet** or the **popover** needs a manual check on iOS Safari and Android Chrome before release, because the automated tests only run in Chromium.
