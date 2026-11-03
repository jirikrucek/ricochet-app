# ADR 0019: Render Tables Without a Table Library

- Status: Accepted
- Created: 2026-11-03
- Updated: 2026-11-03
- Supersedes: ADR 0010

## Context

The **player overview** is the first table in the app. It has three columns, one sortable column, and two single-select filters. ADR 0010 chose hand-written table markup and also placed filtering, sorting and paging in the client. The second part no longer holds (ADR 0020), so this ADR restates the part that does.

## Decision

Render tables with Shadcn `table` markup (`src/ui/table`) and no table library. View state (sort, filters, page) lives in route search params, as ADR 0002 requires.

Generic helpers that carry no business meaning, such as the page-link range, go in the **module**'s `ui/`, and move to `src/shared/ui/` when another **module**'s table needs them.

Revisit this decision when any of these appears:

- a table with several sortable columns,
- multi-column sorting,
- column visibility, resizing, or reordering,
- row selection,
- several complex tables, so that the hand-written logic starts repeating across **modules**.

## Alternatives Considered

- TanStack Table (headless). Rejected: with filtering, sorting and paging in the backend (ADR 0020), it would have almost nothing left to do. Its state would also have to be synced both ways with the URL search params, which adds glue without removing any logic.

## Consequences

- Positive: no extra dependency, and no second state model to sync with the URL.
- Negative: capabilities such as column visibility, row selection, or multi-sort would have to be built by hand. Any of them is a trigger to revisit this ADR rather than to extend the hand-written code.
- Follow-up: when a revisit trigger appears, record the outcome in a new ADR that supersedes this one.
