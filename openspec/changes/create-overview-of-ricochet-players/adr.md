# ADR Review Manifest

- Status: completed
- Review date: 2026-10-19

## Review Summary

ADR review completed for this change. Every ADR in `docs/adr/` was reviewed against `design.md`. Two decisions met the bar (hard to reverse, surprising without context, and a real trade-off) and were recorded as new ADRs: rendering the **player overview** table without a table library (D4), and limiting tests to a local Supabase with **seed data** (D8). Neither supersedes an existing ADR.

These design decisions were reviewed and did not get an ADR:

- D1/D2, the `players` schema and the select-only RLS policy with revoked write grants. These are specific to this table. The RLS rule is already in `docs/standards/security.md`.
- D3, fetching all **players** once. This is tactical and easy to reverse. The design records when to revisit it.
- D5–D7, the page-range helper, URL view state, and UI composition. URL state is already covered by ADR 0002. The rest are implementation details.
- D9, how the seed and **production data** files are handled. This is covered by ADR 0011 and the new testing standard.
- D10, the switch to the publishable key. It is easy to reverse and is recorded in the standards and the deployment guide.

## In-Force ADRs Reviewed

- ADR 0001: Adopt SPA Platform and Core Stack
- ADR 0002: Adopt Type-Safe Frontend Architecture. Its TanStack Table line was removed on 2026-10-19, before this review, so ADR 0010 supersedes nothing.
- ADR 0003: Establish Domain Boundaries and Repository Seams
- ADR 0005: Adopt Frontend Localization with i18next
- ADR 0006: Language Selector Uses Native-Language Labels and Country Flags
- ADR 0007: Adopt Single-Package Layout (supersedes ADR 0004, which was reviewed only as history)
- ADR 0008: Vendored Brand Artwork Keeps Its Own Colours
- ADR 0009: E2E Tests Do Not Use Pixel Snapshots

## New Durable ADRs Created

- [ADR 0010: Render Tables Without a Table Library](../../../docs/adr/ADR0010-render-tables-without-a-table-library.md)
- [ADR 0011: Tests Reach Only a Local Supabase with Seed Data](../../../docs/adr/ADR0011-tests-reach-only-a-local-supabase-with-seed-data.md)
