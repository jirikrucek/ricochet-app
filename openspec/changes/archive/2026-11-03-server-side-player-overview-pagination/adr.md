# ADR Review Manifest

- Status: completed
- Review date: 2026-11-03

## Review Summary

ADR review completed for this change. Moving list queries to the backend contradicts ADR 0010, which also bundled the still-valid "no table library" decision. Following `docs/guides/adrs-guide.md`, ADR 0010 is fully superseded by two new ADRs, one for each decision.

The change marks ADR 0010 as superseded and adds context to ADR 0018's note. The schema's instruction not to touch prior ADR files conflicts with the repository's ADR guide and how ADR 0003 and ADR 0012 were superseded, so the guide was followed: only the `Status` and `Updated` lines of ADR 0010 changed.

D1 to D8 in `design.md` that aren't captured by ADR 0020 are specific to this table and easy to reverse, so they got no ADR of their own.

Related updates: `docs/standards/project-structure-standard.md` (list rule, `domain/` examples) and `docs/standards/security-standard.md` (views and functions).

## In-Force ADRs Reviewed

- ADR 0001, ADR 0002 (URL view state, still followed), ADR 0005, ADR 0006, ADR 0007, ADR 0008, ADR 0009, ADR 0011, ADR 0013, ADR 0014, ADR 0015, ADR 0016 (the constant stays in the module), ADR 0017 (the new queries live in `data-access/api/` and return **domain types**), ADR 0018

## New Durable ADRs Created

- `docs/adr/ADR0019-render-tables-without-a-table-library.md`
- `docs/adr/ADR0020-lists-are-filtered-sorted-and-paged-in-the-backend.md`
