## Why

The **player overview** downloads every **player** and filters, sorts and pages them in the browser, and its fetch fails outright once the list reaches PostgREST's 1000-row response cap. As a general direction, lists in this app must be filtered and paged by the backend, and the number of items per page must be a constant the **visitor** can't change.

## What Changes

- The backend filters, sorts and pages the **players**. The browser receives only the rows of the page it shows, plus the filtered total.
- Sorting moves with paging, because a page can't be cut from an order the backend doesn't know. The rules don't change: language-aware, case-insensitive, ignoring the **surname prefix**, with first name and **surname suffix** as tie-breakers.
- The **nationality** filter's options come from a backend query, because the browser no longer holds every **player**.
- **BREAKING** The "Players per page" selector and the `pageSize` URL param are removed. The page size is fixed at 25, the previous default. A leftover `pageSize` in a shared link is ignored.
- The page-link scenarios that relied on 10 per page now use 250 **players**, because 100 **players** at 25 per page never produce an ellipsis.
- `queryPlayers`, `matchesFilter` and `presentNationalities` are removed from the client.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `players/player-overview`: the page size is fixed instead of chosen by the **visitor**, and the browser loads only the page it shows.

## Out of Scope

- Visual changes to the table, the filters or the page links, beyond removing the selector.
- Changing the page size to anything but today's default of 25.
- Cursor-based paging: page links and shareable page URLs need numbered pages.
- Tournaments and other future lists. They follow the new ADR when they are built.

## Traceability

No issue exists for this change: it comes directly from a request by the product owner. ADR 0018 recorded it as future work ("Moving it to the server is a separate issue").

## Impact

- **Database**: a new migration adds six ICU collations, the `player_sorted` type, the `players_sorted` function and the `player_nationalities` view. It only adds objects, so the previous frontend keeps working after it is applied.
- **Release order**: the migration must reach the Preview and Production Supabase projects before the frontend deploys (`docs/guides/deployment-guide.md`).
- **Code**: the `players` **module**'s `data-access/`, `domain/`, `ui/PlayerPagination` and `features/player-overview`, plus all six locale files.
- **Docs**: ADR 0010 is superseded, ADR 0018 gets a note, and the project structure and security standards are updated.
