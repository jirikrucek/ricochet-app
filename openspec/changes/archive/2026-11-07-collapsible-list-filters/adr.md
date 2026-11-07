# ADR Review Manifest

- Status: completed
- Review date: 2026-11-07

## Review Summary

ADR review completed for this change. Two decisions met the bar for a repository-level ADR: the collapsible filters pattern that every list follows, and how it is built on native semantics first in a client-rendered SPA. The first is a long-term commitment that future lists inherit, and the second would surprise a reader who expects a no-JavaScript baseline. Neither is captured by an in-force ADR, and neither departs from one. The standard that applies them was created in the same step.

## In-Force ADRs Reviewed

- ADR 0001: Adopt SPA Platform and Core Stack. It rules out a real no-JavaScript baseline without a platform change.
- ADR 0002: Adopt Type-Safe Frontend Architecture. The view stays in the URL, and the **filter draft** is a React Hook Form form validated by Zod.
- ADR 0005: Adopt Frontend Localization with i18next. Every new string is a key in all six languages.
- ADR 0006: Language Selector Uses Native-Language Labels and Country Flags. Not affected.
- ADR 0007: Adopt Single-Package Layout. Not affected.
- ADR 0008: Vendored Brand Artwork Keeps Its Own Colours. Not affected.
- ADR 0009: E2E Tests Do Not Use Pixel Snapshots. The new end-to-end checks assert roles and attributes.
- ADR 0011: Tests Reach Only a Local Supabase with Seed Data. Not affected.
- ADR 0013: Preview and Production Use Separate Supabase Projects. Not affected.
- ADR 0014: Report Client Errors and Logs to Sentry. Not affected, because no new Supabase call is added.
- ADR 0015: Shadcn Components Use Base UI Primitives. The Popover is added through shadcn on Base UI.
- ADR 0016: Modules Own Their Code by Default. The component starts in the players **module**, and only the 744px media query becomes **shared code**, because `TopNav` is a second consumer.
- ADR 0017: Data Access Maps Backend Rows to Domain Types. Not affected.
- ADR 0018: Trusted Business Rules Live in the Backend. Not affected, because filtering is not a trusted rule.
- ADR 0019: Render Tables Without a Table Library. Not affected.
- ADR 0020: Lists Are Filtered, Sorted and Paged in the Backend. Filtering stays in the backend, and the URL params are unchanged.

ADRs 0003, 0004, 0010 and 0012 are superseded and were read only as history.

## New Durable ADRs Created

- ADR 0021: Lists Show Filters in a Collapsible Panel Applied with One Button (`docs/adr/ADR0021-lists-show-filters-in-a-collapsible-panel-applied-with-one-button.md`).
- ADR 0022: List Filters Use Native Semantics First (`docs/adr/ADR0022-list-filters-use-native-semantics-first.md`).

## Standards and Guides

- Created `docs/standards/list-filters-standard.md`, with its trigger added to `AGENTS.md`.
- No guide needed a change.
