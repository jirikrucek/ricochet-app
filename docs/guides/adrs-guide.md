# ADRs Guide

ADRs live in `docs/adr/` as `ADRNNNN-kebab-case-slug.md` with sequential 4-digit numbers: `ADR0001-slug.md`, `ADR0002-slug.md`, etc. To number a new ADR, take the highest number in `docs/adr/` and add one.

When creating or updating an ADR, use `/architectural-decision-records` skill.

## When to offer an ADR

All three of these must be true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will look at the code and wonder "why on earth did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If a decision is easy to reverse, skip it: you'll just reverse it. If it's not surprising, nobody will wonder why. If there was no real alternative, there's nothing to record beyond "we did the obvious thing."

### What qualifies

- **Architectural shape.** "We're using a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration patterns between contexts.** "Ordering and Billing communicate via domain events, not synchronous HTTP."
- **Technology choices that carry lock-in.** Database, message bus, auth provider, deployment target. Not every library: just the ones that would take a quarter to swap out.
- **Boundary and scope decisions.** "Customer data is owned by the Customer context; other contexts reference it by ID only." The explicit no-s are as valuable as the yes-s.
- **Deliberate deviations from the obvious path.** "We're using manual SQL instead of an ORM because X." Anything where a reasonable reader would assume the opposite. These stop the next engineer from "fixing" something that was deliberate.
- **Constraints not visible in the code.** "We can't use AWS because of compliance requirements." "Response times must be under 200ms because of the partner API contract."
- **Rejected alternatives when the rejection is non-obvious.** If you considered GraphQL and picked REST for subtle reasons, record it; otherwise someone will suggest GraphQL again in six months.

## Writing an ADR

- One decision per ADR. Split a bundle of decisions into several ADRs.
- Use terms from the glossary, `glossary/business.md` or `glossary/technical.md`.
- If the decision contradicts an existing ADR, say so explicitly and supersede that ADR (see below).

## Changing an existing ADR

There are only two ways to change an ADR: edit it in place, or supersede it with a new ADR. ADRs are never partially superseded.

| Change | Action |
| --- | --- |
| Wording, typos, links, renamed paths, or added context. The decision stays the same. | Edit in place and bump the `Updated` date. |
| Any part of the decision changes: the choice, its scope, or a key constraint. | Write a new ADR that restates the whole decision. Set the old ADR's status to `Superseded by ADR NNNN` and add `Supersedes: ADR NNNN` to the new one. |

When superseding:

- Leave the old ADR's body alone. Change only its `Status` and `Updated` lines. Later, fix only broken links and renamed paths in it, bumping `Updated`.
- The new ADR must stand on its own. A reader should never need the superseded ADR to know what currently applies.
- If the old ADR bundled several decisions and only one changes, the old ADR is still fully superseded. Write a new ADR for the changed decision, and move each decision that still holds into its own new ADR.

Statuses:

| Status | Use when |
| --- | --- |
| `Proposed` | Under review |
| `Accepted` | The team committed to the decision |
| `Deprecated` | No longer applies and nothing replaces it |
| `Superseded by ADR NNNN` | Replaced by another ADR |

## ADR index

[`docs/adr/README.md`](../adr/README.md) lists every ADR with its status. Update it in the same change whenever you add an ADR or change an ADR's status.
