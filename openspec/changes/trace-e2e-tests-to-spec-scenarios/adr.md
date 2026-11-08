# ADR Review Manifest

- Status: completed
- Review date: 2026-11-08

## Review Summary

ADR review completed for this change. Every ADR in `docs/adr/` was reviewed against `design.md`. No major durable architectural decisions were introduced, and no new repository-level ADR files were created.

The main decision is that every E2E test outside `tests/e2e/internals/` covers a spec scenario, and `npm run spec:coverage` enforces it. It meets two of the three conditions in `docs/guides/adrs-guide.md`: it can surprise a reader, and it comes from a real trade-off between complete specs and specs bloated with implementation detail. It fails the first condition: it is easy to reverse, since dropping it means deleting half a check and a paragraph of the testing standard. The testing standard's **Spec scenarios** section therefore records the rule and its reason, with a link to issue #98.

The other decisions in `design.md` (one shared matching rule, the folder as the exemption, the two-part report, skipping a change whose proposal isn't done) are tactical choices about one script. They don't bind future changes.

## In-Force ADRs Reviewed

Touching this change:

- ADR 0009: E2E Tests Do Not Use Pixel Snapshots. The `Sheet` width tests measure element widths, which it allows, and they move to `tests/e2e/internals/` unchanged.
- ADR 0011: Tests Reach Only a Local Supabase with Seed Data. The long-name test keeps intercepting the players request, because the **seed data** can't produce the case.
- ADR 0014: Report Client Errors and Logs to Sentry. `fixtures.spec.ts` tests the fixture that fails a test on a Sentry report, and moves to `tests/e2e/internals/` unchanged.

Reviewed, not touched: ADR 0001, 0002, 0005, 0006, 0007, 0008, 0013, 0015, 0016, 0017, 0018, 0019, 0020, 0021, 0022. ADR 0003, 0004, 0010, and 0012 are superseded and were read as history only.

## New Durable ADRs Created

- None. No major durable architectural decisions were introduced.

## Standards and Guides

No architectural decision was taken, so no standard or guide changes for one. The change still updates `docs/standards/testing-standard.md`, `docs/standards/project-structure-standard.md`, and `docs/guides/testing-guide.md`, as its tasks.
