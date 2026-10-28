---
name: validate-standards
description: "Validate that the standards in docs/standards are sound."
disable-model-invocation: true
---

The user has asked you to validate the **standards** in `docs/standards/`. A standard is a rule every change must follow. `AGENTS.md` makes checking changes against the standards part of the Definition of Done, so one wrong standard misleads every later change.

The standards themselves are what gets validated: each must be **sound**. The code is evidence about whether a standard is sound, not the subject of the audit. If the user names a standard or an area, validate only that scope.

## Steps

1. Call the Skill tool with `writing-for-agents`: the standards are documents agents consume.

2. Gather the sources of truth: every file in `docs/standards/`, the standards and guides sections of `AGENTS.md`, the accepted ADRs in `docs/adr/`, and the tooling the standards name (package scripts, lint, test and build configs, CI workflows, migrations). Done when every path, command and config a standard names has been opened or run.

3. Audit each standard for soundness with the checks below. Record a finding as: file, claim, and the evidence that contradicts it. Done when every rule of every standard has a verdict: sound, or a finding.

   - **Rule**: each statement is something the code can satisfy or violate. Workflow steps, setup instructions, verification procedures and status narratives ("X is installed and configured") are how-tos; they belong in `docs/guides/`, reached through a pointer in `AGENTS.md`.
   - **Drift**: each claim matches the codebase today: paths, file names, scripts, folder trees, config values, lists of members. A folder that doesn't exist yet and a folder that was removed are both drift.
   - **Agreement**: no conflict with an accepted ADR, another standard, or `AGENTS.md`. A rule that another rule makes impossible to follow is a conflict.
   - **Source of truth**: a standard points at config or code instead of copying it, because a copy is a cache that goes stale. The triggers for reading a standard live in `AGENTS.md` only.
   - **Enforced**: each rule names what enforces it (lint rule, type, test, CI step) or is a judgement call checked in review. A mechanically checkable rule without enforcement is a candidate for a lint rule or test.
   - **Coverage**: a convention the code follows consistently that no standard states is a candidate for a new rule. So is an inconsistency no standard settles.

4. Fix what is unambiguous in the docs: drift, how-tos moved to a guide (with its `AGENTS.md` pointer). Ask the user, with a recommendation, about every item that adds, changes or removes a rule, adds enforcement, or needs a code change to make a rule followable. Done when the user has decided every open item.

5. Apply the decisions. Done when re-running step 3 on the changed standards yields no findings.

6. Run the Definition of Done in `AGENTS.md`. Start any service the tests need and stop what you started afterwards. Done when every phase passes.

7. Report what changed and what was decided. Commit only after the user approves, in logical groups (docs, code), using Conventional Commits.
