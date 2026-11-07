# Workflows Guide

Which skill to run for each kind of work in this codebase. Skills marked _(human only)_ start only when a human types the slash command; when an agent reaches one, it names the command to the user and waits.

## Change workflow

Every feature, bug fix, or refactor follows this path. When the idea is still fuzzy, run `/openspec-explore` first, until you can name what changes.

Each step ends on its **done when**; finish it before moving on. A human or an agent may do any step, as the human prefers, except those marked _(human only)_: an agent that reaches one hands over to the human and waits.

1. **Branch**: create a Conventional Branch off `main`. Done when `HEAD` is on the new branch.
2. **Create change**: run `/openspec-new-change`. Done when `openspec/changes/<name>/` exists.
3. **Plan**: run `/openspec-continue-change` once per planning artifact, or `/openspec-ff-change` to create them all in one pass. Done when `openspec status --change <name>` shows every artifact complete.
4. **Implement**: run `/openspec-apply-change`. Each slice ends with a `/code-health` task, and the task list ends with `/production-readiness`, then the Definition of Done from `AGENTS.md`. When the plan turns out wrong mid-way, revise it with `/openspec-update-change` and resume. Done when every task in `tasks.md` is checked.
5. **Verify**: run `/openspec-verify-change`, and re-run the Definition of Done after any code change it leads to. Done when it reports no CRITICAL issues.
6. **Pull request**: commit, then write the body with `/pr`. Done when the PR is open against `main` and its checks pass.
7. **Review** _(human only)_: review the PR and request changes. Address each one, re-running Verify and the Definition of Done after any code change. Done when the PR is approved.
8. **Archive**: run `/openspec-archive-change`, then commit and push to the PR branch. Done when the change sits under `openspec/changes/archive/`, its delta specs are merged into `openspec/specs/`, `npm run spec:validate` passes on the merged specs, and the PR checks pass again.
9. **Merge** _(human only)_: merge the PR into `main`. Done when the PR shows as merged.

Dependency updates, tooling config, and docs-only edits have no `tasks.md`: create the branch, run the Definition of Done from `AGENTS.md`, then follow steps 6, 7, and 9.

## Maintenance

| Workflow             | Skill                                                                     | Reach for it when                                                                    |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Diagnose a bug       | `/diagnosing-bugs`                                                        | something is broken, failing, or got slower and the cause is unclear; the fix then enters the change workflow |
| Optimize performance | `/performance-optimization`                                               | a page or query misses a performance target (Core Web Vitals, a budget in the spec); measure first, and the fix enters the change workflow |
| Improve architecture | `/improve-codebase-architecture` _(human only)_                            | you want a visual report of which modules are worth deepening first                  |
| Audit                | `/audit` _(human only)_                                                    | you want to sweep the codebase for violations of standards and accepted ADRs, fix the approved ones, and commit |
| Validate docs        | `/validate-adrs`, `/validate-guides`, `/validate-standards` _(human only)_ | you changed `docs/adr/`, `docs/guides/`, or `docs/standards/`, or want to check they still hold |

## Research

| Workflow  | Skill        | Reach for it when                                                       |
| --------- | ------------ | ----------------------------------------------------------------------- |
| Research  | `/research`  | you need a cited answer from primary sources, saved as Markdown          |
| Prototype | `/prototype` | a design question is cheaper to answer with throwaway code than debate  |
| Grilling  | `/grilling`  | you want a plan or decision stress-tested before you commit to it       |

## Sessions and harness

| Workflow         | Skill                     | Reach for it when                                                                  |
| ---------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| Hand-off         | `/handoff` _(human only)_  | a long session should continue in a fresh agent                                    |
| Retrospective    | `/retro` _(human only)_    | a session is over and you want to improve skills, docs, or `AGENTS.md` for the next one |
| Write for agents | `/writing-for-agents`     | you create or edit a skill, `AGENTS.md`, or any doc agents read                    |
