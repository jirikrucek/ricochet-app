# Workflows Guide

Which skill to run for each kind of work in this codebase. Skills marked _(user-only)_ start only when a human types the slash command; when an agent reaches one, it names the command to the user and waits.

## Change workflow

Every feature, bug fix, or refactor follows this path. When the idea is still fuzzy, run `/openspec-explore` first, until you can name what changes.

Each step ends on its **done when**; finish it before moving on.

1. **Branch**: create a Conventional Branch off `main`. Done when `HEAD` is on the new branch.
2. **Create change**: run `/openspec-new-change`. Done when `openspec/changes/<name>/` exists.
3. **Plan**: run `/openspec-continue-change` once per planning artifact, or `/openspec-ff-change` to create them all in one pass. Done when `openspec status --change <name>` shows every artifact complete.
4. **Implement**: run `/openspec-apply-change`. When the plan turns out wrong mid-way, revise it with `/openspec-update-change` and resume. Done when every task in `tasks.md` is checked.
5. **Verify**: run `/openspec-verify-change`. Done when it reports no CRITICAL issues.
6. **Review**: run `/review` and fix what it finds. Done when no critical finding is open.
7. **Definition of Done**: run its phases from `AGENTS.md`. Done when the final report is all OK.
8. **Archive**: run `/openspec-archive-change`. Done when the change sits under `openspec/changes/archive/` and its delta specs are merged into `openspec/specs/`, and `npm run spec:validate` passes again on the merged specs.
9. **Pull request**: commit, then write the body with `/pr`. Done when the PR is open against `main`.

Dependency updates, tooling config, and docs-only edits run only steps 1, 7, and 9: branch, Definition of Done, pull request.

## Maintenance

| Workflow             | Skill                                                                     | Reach for it when                                                                    |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Diagnose a bug       | `/diagnosing-bugs`                                                        | something is broken, failing, or slow and the cause is unclear; the fix then enters the change workflow |
| Improve architecture | `/improve-codebase-architecture` _(user-only)_                            | you want a visual report of which modules are worth deepening first                  |
| Audit                | `/audit` _(user-only)_                                                    | you want to sweep the codebase for violations of standards and accepted ADRs, fix the approved ones, and commit |
| Validate docs        | `/validate-adrs`, `/validate-guides`, `/validate-standards` _(user-only)_ | you changed `docs/adr/`, `docs/guides/`, or `docs/standards/`, or want to check they still hold |

## Research

| Workflow  | Skill        | Reach for it when                                                       |
| --------- | ------------ | ----------------------------------------------------------------------- |
| Research  | `/research`  | you need a cited answer from primary sources, saved as Markdown          |
| Prototype | `/prototype` | a design question is cheaper to answer with throwaway code than debate  |
| Grilling  | `/grilling`  | you want a plan or decision stress-tested before you commit to it       |

## Sessions and harness

| Workflow         | Skill                     | Reach for it when                                                                  |
| ---------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| Hand-off         | `/handoff` _(user-only)_  | a long session should continue in a fresh agent                                    |
| Retrospective    | `/retro` _(user-only)_    | a session is over and you want to improve skills, docs, or `AGENTS.md` for the next one |
| Write for agents | `/writing-for-agents`     | you create or edit a skill, `AGENTS.md`, or any doc agents read                    |
