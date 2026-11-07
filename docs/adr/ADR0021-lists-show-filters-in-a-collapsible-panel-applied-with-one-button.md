# ADR 0021: Lists Show Filters in a Collapsible Panel Applied with One Button

- Status: Accepted
- Created: 2026-11-07
- Updated: 2026-11-07

## Context

The **player overview** shows its two **filters** as always-visible selects, and each one applies the moment an option is picked. Every list the app adds will need **filters**, starting with tournaments, so the pattern is chosen once instead of per screen.

The always-visible selects have three problems:

- They take room that grows with every **filter** a list gains.
- Each pick runs a query, and a screen reader user gets no single moment at which the result is announced.
- There is no way to choose several **filters** and apply them together.

A prototype compared three variants on the real `/players` route: a panel that opens inline and pushes the table down, a **popover**, and a **sheet**. The inline panel moved the table when it opened or closed. The **popover** fits wide screens and covers too much of a phone. The **sheet** suits a phone and is heavy for two selects on a desktop. Keyboard checks of the prototype also found that after Apply the focus fell to the page body and that nothing announced the result, both of which this decision fixes by design. The prototype was only tested in headless Chromium. Real-device behaviour on iOS Safari and Android Chrome is `Unknown` until the release check.

## Decision

Every list with at least one **filter** uses one **filters button** that opens a **filters panel**, and applies **filters** only when the **visitor** clicks Apply.

- **Filter type.** Single-select only. Multi-select, ranges and text search are not decided here and need their own decision when a screen needs them.
- **Button and panel.** The **filters button** shows how many **filters** are applied. The **filters panel** holds one control per **filter** and an Apply button.
- **Draft.** Choosing an option changes only the **filter draft**. Apply applies the whole draft at once and collapses the panel. Any other way of closing the panel discards the draft.
- **Presentation.** At and above the `tablet` breakpoint (744px) the panel is a **popover** anchored to the button. Below it, the panel is a **sheet** that slides up from the bottom. The choice is by viewport width, not pointer type. If the viewport crosses the breakpoint while the panel is open, the panel closes and the draft is discarded.
- **Applied filters.** Each **applied filter** shows as a removable chip beside the button, and one Clear all filters action removes all of them. It is the only action for clearing everything, so an empty result needs no second one.
- **Orientation.** After the **visitor** applies filters, removes a chip, or clears all, focus returns to the **filters button** and the result is announced in a polite live region once the new rows are shown.
- **Existing rules still hold.** The view stays in the URL (ADR 0002), a filter change returns to page 1 as one history entry, and filtering stays in the backend (ADR 0020).
- **Built on.** Base UI's Popover and the existing `Sheet` (ADR 0015). The **filter draft** is a React Hook Form form validated by Zod (ADR 0002).
- **Where the code lives.** A generic, props-driven component starts in the **module** that owns the first list and moves to **shared code** when a second **module** needs it (ADR 0016).

`docs/standards/list-filters-standard.md` holds the rules every list follows.

## Alternatives Considered

- Keep the always-visible selects that apply on change. Rejected: they take room that grows with every **filter**, run a query per pick, and give no moment to announce a result.
- A panel that opens inline and pushes the table down. Rejected: opening and closing it moves the table, which the **popover** and the **sheet** avoid.
- A **popover** on every screen size. Rejected: on a phone it covers the table and is awkward to reach.
- A **sheet** on every screen size. Rejected: on a desktop it is a modal for two selects, and it hides the table that is being filtered.
- A side drawer on narrow screens. Rejected: Apply sits further from the thumb than in a bottom sheet, and the existing `Sheet` is capped at 8px wide on its sides until #92 is fixed.
- Choosing the **sheet** by pointer type instead of viewport width. Rejected: a touch tablet at 744px or wider gets the **popover**, which works with touch, and width is predictable and testable.

## Consequences

- Positive: every list behaves the same, and a new list declares its **filters** instead of rebuilding the pattern.
- Positive: the table does not move when the panel opens or closes, and screen reader users get one clear moment of feedback after Apply.
- Negative: **filters** take one more click to use than always-visible selects. The chips keep the applied **filters** visible, and the count shows that some are applied.
- Negative: there are two overlay implementations to test, a **popover** and a **sheet**, each needing an end-to-end check at its own viewport.
- Negative: this is the first form to use React Hook Form, so it also sets the pattern for the forms that follow.
- Follow-up: the generic API is shaped by one list and is revisited when the second list arrives.
- Follow-up: a real-device check on iOS Safari and Android Chrome gates the release, and decides whether mobile falls back to native pickers.

## Notes

- Issue #93 holds the summary and the interview that led here. The prototype is kept on the throwaway branch `feature/progressive-player-filters-prototype` and is not for `main`.
