# ADR 0020: Lists Are Filtered, Sorted and Paged in the Backend

- Status: Accepted
- Created: 2026-11-03
- Updated: 2026-11-03
- Supersedes: ADR 0010

## Context

ADR 0010 had the **player overview** download every **player** and filter, sort and slice them in the browser. That sends data nobody asked to see, and it stops working at PostgREST's 1000-row response cap. Filtering and paging aren't trusted rules, so ADR 0018 doesn't require them to be in the backend. The reason here is the cost of the list, not trust.

The obvious part is `.eq()` and `.range()`. The less obvious part is that a page can only be cut from an order the backend knows, so the sort moves as well, and PostgREST can't pick a collation per request. Anything else that relied on the browser holding every row, such as the options of a filter, needs its own query.

## Decision

A list of any length that can grow is filtered, sorted and paged in the backend. The browser receives one page and the filtered total.

- **Paging and filtering use PostgREST's own operators** (`.eq()`, `.range()`, `count: 'exact'`) in `data-access/api/` (ADR 0017), not hand-written parameters on a function.
- **The page size is a constant, not view state.** A **visitor** can't choose it and it isn't in the URL. Every list in the app uses the same one, `itemsPerPage` in `src/config/pagination.ts`, so it has no owning **module**.
- **A sort that PostgREST can't express lives in a function**, which returns every row with a position to order by, for example `players_sorted(ui_language)`. The position is unique, so a row can't move between pages from one request to the next, and reversing it reverses every sort key.
- **Language-aware sorting uses one ICU collation per UI language.** Adding a UI language needs a migration that adds its collation.
- **Facts about the whole list get their own query**, for example the `player_nationalities` view behind the **nationality** filter.
- **A page beyond the last falls back to page 1** in the `data-access/api/` function, which returns the page it actually served.

Short lists that can't grow, such as the options of a filter, may still be sorted in the client when only the client has what the sort needs, such as translated names.

## Alternatives Considered

- Keep paging in the client, fetching more rows as needed. Rejected: the browser would still hold the whole list, and the cap would still apply.
- One function taking filters, sort, limit and offset. Rejected: it re-implements what PostgREST provides, and needs its own way of returning the total.
- A view with one collated column per language and sort key. Rejected: 18 columns for one table, and a column per language leaks into the client's order clause.
- Ordering inside a function and relying on the outer query to keep it. Rejected: SQL doesn't guarantee it, and a page boundary depends on it.
- A page size in the URL, chosen by the **visitor**. Rejected by the product owner: one size keeps the interface and the shared links simple.

## Consequences

- Positive: a page costs the same however long the list gets, and the 1000-row cap no longer matters.
- Positive: the order is the same for every **visitor** of a language, whatever their browser's ICU data.
- Negative: every view change is a round trip, where filtering used to be instant. A cache and keeping the previous page on screen soften it.
- Negative: sort rules are now SQL, tested by integration tests against a local Supabase instead of fast unit tests.
- Negative: each page request sorts the whole table. That's negligible for today's list, and needs an index-backed design if a list reaches tens of thousands of rows.
- Negative: E2E tests can't cut pages by intercepting a single request any more. A state the seed can't produce, such as 250 **players**, needs interception that answers per page.
