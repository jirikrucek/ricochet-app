# Custom ADR Template

Project-specific style. Matches the existing ADRs in `docs/adr/`. Naming, numbering, writing and changing rules are in `docs/guides/adrs-guide.md`.

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

## Sections

- Context and Decision are required.
- `Alternatives Considered`, `Consequences` and `Notes` are optional; include them only when they add value.
