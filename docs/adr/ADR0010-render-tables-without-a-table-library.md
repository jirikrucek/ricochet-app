# ADR 0010: Render Tables Without a Table Library

- Status: Accepted
- Created: 2026-10-19
- Updated: 2026-10-19

## Context

The **player overview** (issue #58) is the first table in the app. It has three columns and one sortable column, Surname. It also has two single-select filters, **nationality** and **sex**, and client-side pagination. The sort is language-aware and ignores the **surname prefix**. It breaks ties by first name, then by **surname suffix**, and a descending sort reverses every key.

## Decision

Render tables with Shadcn `table` markup (`src/ui/table`) and no table library. Filtering, sorting, and page slicing are a single pure query function in the owning domain module, for example `queryPlayers(players, view, locale)` in `src/domain/players/`. It returns the visible rows plus the total, the effective page, and the page count. The feature component calls it and renders the result. View state (sort, filters, page, page size) lives in route search params, as ADR 0002 requires.

Generic helpers that carry no business meaning, such as the page-link range, go in `src/lib/` so other tables can reuse them.

Revisit this decision when any of these appears:

- a table with several sortable columns,
- multi-column sorting,
- column visibility, resizing, or reordering,
- row selection,
- several complex tables, so that the hand-written logic starts repeating across features.

## Alternatives Considered

- TanStack Table (headless) with its sorting, filtering, and pagination models. Rejected: one sortable column and two filters don't justify a headless table engine. The three-key, locale-aware comparator would still have to be written by hand as a custom `sortingFn`. The table state would also have to be synced both ways with the URL search params, which adds glue without removing any logic.
- Splitting filter, sort, and slice into three separately composed functions. Rejected: a single entry point keeps the order (filter, then sort, then slice) and the out-of-range page fallback in one place, covered by one set of unit tests.

## Consequences

- Positive: every table rule is a pure function, covered by unit tests with **mock data** and no React.
- Positive: no extra dependency, and no second state model to sync with the URL.
- Negative: features such as column visibility, row selection, or multi-sort would have to be built by hand. Any of them is a trigger to revisit this ADR rather than to extend the hand-written code.
- Follow-up: when a revisit trigger appears, record the outcome in a new ADR that supersedes this one.