# Custom ADR Template

Project-specific style. Matches the existing ADRs in `docs/adr/` and `docs/guides/adrs.md`.

## File

- Location: `docs/adr/ADRNNNN-kebab-case-slug.md`. Scan `docs/adr/` for the highest number and increment by one (4 digits).
- Create an ADR only when the decision is hard to reverse, surprising without context, and a real trade-off (see `docs/guides/adrs.md`).

## Template

```md
# ADR NNNN: {Short Title Case Decision}

- Status: Proposed | Accepted | Deprecated | Superseded by ADR NNNN
- Created: YYYY-MM-DD
- Updated: YYYY-MM-DD
- Supersedes: ADR NNNN (when replacing an existing decision)

## Context

{Why the decision was needed: requirements, constraints, forces. Known facts only; write `Unknown` rather than inventing.}

## Decision

{What we decided, in active voice ("Adopt ...", "We will ..."), with the specifics a maintainer needs.}

## Alternatives Considered

- {Option}. Rejected: {why it lost}.

## Consequences

- {Positive, negative, and follow-up work. Only non-obvious downstream effects.}

## Notes

- {Other things worth mentioning.}

```

## Rules

- One decision per ADR.
- `Alternatives Considered`, `Consequences` and `Notes` are optional; include them only when they add value. Context and Decision are required.
- Never rewrite an accepted ADR to change the decision. Add a new ADR and mark the old one `Superseded by ADR NNNN`.
- Use terms from the glossary.
- If the decision contradicts an existing ADR, say so explicitly.
