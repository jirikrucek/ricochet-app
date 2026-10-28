---
name: validate-adrs
description: "Validate that the ADRs in docs/adr are sound."
disable-model-invocation: true
---

The user has asked you to validate the **ADRs** in `docs/adr/`. An ADR records an architectural decision and why it was made. `AGENTS.md` makes checking changes against the accepted ADRs part of the Definition of Done, so one wrong ADR misleads every later change.

The ADRs themselves are what gets validated: each must be **sound**. The code is evidence about whether an ADR is sound, not the subject of the audit. If the user names an ADR or an area, validate only that scope.

An ADR is a **record**: `docs/guides/adrs-guide.md` allows only an in-place edit that keeps the decision, or a new ADR that supersedes it. Every fix you propose takes one of those two forms.

## Steps

1. Call the Skill tool with `writing-for-agents`: the ADRs are documents agents consume.

2. Gather the sources of truth: every file in `docs/adr/`, `docs/guides/adrs-guide.md` (the rules the checks apply), `AGENTS.md`, `docs/standards/`, `glossary/`, the git history of each ADR (`git log --follow -p`), and the code, config and dependencies each accepted ADR names. Done when every path, package, folder, tool and enforcement mechanism an accepted ADR names has been opened or looked up.

3. Audit each ADR with the checks below. Accepted and proposed ADRs get every check. Superseded and deprecated ADRs are history: check them for **Lifecycle** and resolving links only. Record a finding as: file, claim, and the evidence that contradicts it. Done when every check of every ADR in scope has a verdict: sound, or a finding.

   - **Qualifies**: the decision passes all three tests of the guide: hard to reverse, surprising without context, the result of a real trade-off. A rule every change follows with no trade-off behind it belongs in `docs/standards/`.
   - **One decision**: the ADR records one decision. A bundle is a finding even when each part qualifies.
   - **Rationale**: the context names the forces that drove the decision, the alternatives were real options with stated reasons for rejection, and the consequences include the negatives.
   - **Lifecycle**: the `Status` line matches the index in `docs/adr/README.md`, and every ADR is in the index. A supersession links both ways (`Superseded by ADR NNNN` and `Supersedes: ADR NNNN`). A superseded ADR's body is unchanged since supersession, except its `Status` and `Updated` lines. A superseding ADR stands on its own: a reader never needs the old ADR to know what applies. `Updated` is bumped on every in-place edit after creation.
   - **Currency**: each fact an accepted ADR states matches the codebase today: paths, folder names, packages, tools, enforcement. A renamed path is a wording fix. A decision the code no longer follows is either a superseded decision or a code bug, and the user decides which.
   - **Agreement**: no conflict with another accepted ADR, a standard, or `AGENTS.md`. Terms match `glossary/`. Every cross-reference link resolves.
   - **Source of truth**: the ADR holds the decision and its why; the rules every change follows live in a standard, and the ADR points to it. A rule restated in both places is a copy that drifts.
   - **Coverage**: a decision the codebase clearly embodies (a lock-in technology, a boundary, a deliberate departure from the obvious path) that passes **Qualifies** and no accepted ADR records is a candidate for a new ADR.

4. Fix what is unambiguous with an in-place edit, bumping `Updated`: broken links, renamed paths, glossary terms, and index or status-link mismatches. Report findings against an older ADR's form (**One decision**, **Rationale**) without rewriting it; that ADR is rewritten only when its decision changes. Ask the user, with a recommendation, about every item that supersedes or deprecates an ADR, moves a decision into a standard, adds an ADR for a **Coverage** candidate, or needs a code change to follow an ADR. Done when the user has decided every open item.

5. Apply the decisions. Write a new or superseding ADR with the `architectural-decision-records` skill, and update the index in the same change. Done when re-running step 3 on the changed ADRs yields no findings.

6. Run the Definition of Done in `AGENTS.md`. Start any service the tests need and stop what you started afterwards. Done when every phase passes.

7. Report what changed and what was decided. Commit only after the user approves, in logical groups (docs, code), using Conventional Commits.
