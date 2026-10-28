---
name: audit
description: "Audit the codebase for violations of the standards and accepted ADRs, fix the approved ones, and commit after review."
disable-model-invocation: true
---

The user has asked you to **audit** the codebase. A **violation** is code, config, test or migration that breaks a rule in `docs/standards/` or a decision in an accepted ADR. The documents are the rules here; the code is what gets audited. A rule that turns out to be wrong is not a violation: it's a finding for `/validate-standards` or `/validate-adrs`, and you report it in a separate list.

The default scope is the whole codebase: every file `git ls-files` lists, except generated files (those the toolchain writes, such as `src/repositories/database.types.ts`). If the user names a standard, an ADR or an area, audit only that scope.

## Steps

1. Pin the rules. A **lens** is one rule document: each file in `docs/standards/`, and each ADR whose status in `docs/adr/README.md` is `Accepted`. Run `npm run typecheck` and `npm run lint` once and keep their output: a rule a tool enforces gets its verdict from that output, not from reading the code. Done when the lens list and both tool outputs are in hand.

2. Send one Agent call per lens, all in a single message, so they run in parallel. Each prompt carries:

   - The lens file path, the scope, and the tool output from step 1.
   - The brief: "Audit only: report violations and leave every file unedited. Read the lens, then check every rule in it against the code in scope. A rule gets its verdict from the tool output when a tool enforces it, and from the code otherwise. Per violation: the rule (quoted), the file and line, the evidence, and the fix. List separately any rule the code can't follow or that contradicts another document. In one line, name the rules that came back clean. Under 500 words."

   Done when every lens has reported, or you've marked a failed lens as failed and re-run it once.

3. Present the violations as one table per lens, in lens-list order, then the list of rule findings. Mark each violation **fix** (the fix is unambiguous) or **ask** (you need the user's call), and recommend a resolution for each **ask**. A fix that departs from an accepted ADR is always **ask**, because it means writing a new ADR that supersedes it. Done when the user has approved, rejected or resolved every violation. Edit nothing before then.

4. Fix the approved violations. If the branch is `main`, first create a branch with Conventional Branch naming. Done when every approved violation is fixed and a re-run of its lens on the changed files reports it gone.

5. Run the Definition of Done in `AGENTS.md`. Start any service the tests need and stop what you started afterwards. Done when every phase passes.

6. Hand over for review: the Definition of Done report, the `git diff --stat`, and each violation next to the change that fixed it. Done when the user approves the diff. Apply what they ask for in review, then repeat steps 5 and 6.

7. Commit in logical groups (one per lens is the default), using Conventional Commits. Done when `git status` is clean.
