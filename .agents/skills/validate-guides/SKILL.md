---
name: validate-guides
description: "Validate that the guides in docs/guides work as written."
disable-model-invocation: true
---

The user has asked you to validate the **guides** in `docs/guides/`. A guide is a how-to for a codebase workflow. `AGENTS.md` points an agent at a guide before a task, and the agent follows it literally, so one wrong command or path derails every later run.

The guides themselves are what gets validated: each must **work as written**. The code and tooling are evidence about whether a guide works, not the subject of the audit. If the user names a guide or an area, validate only that scope.

## Steps

1. Call the Skill tool with `writing-for-agents`: the guides are documents agents consume.

2. Gather the sources of truth: every file in `docs/guides/`, the standards and guides sections of `AGENTS.md`, `docs/standards/`, the accepted ADRs in `docs/adr/`, the skills that read a guide (grep `.agents/skills/` for the guide's name or folder), and the tooling the guides name (package scripts, configs, CI workflows, migrations, `supabase/`, `vercel.json`). Done when every path, command, script, config key and env var a guide names has been opened or looked up.

3. Audit each guide with the checks below. Run only read-only commands: open files, `--help`, `--list`, `status`, `gh` reads. A command that deploys, writes to a remote, mutates a database, or starts a long-running service is verified by reading its definition. Record a finding as: file, claim, and the evidence that contradicts it. Done when every step, command and claim of every guide has a verdict: works, or a finding.

   - **Works**: each command exists and takes the flags and arguments the guide gives; each path, file, script and env var exists; steps run in an order that succeeds.
   - **Drift**: each claim matches the codebase today: file names, scripts, config values, lists of members, tool behaviour. A thing that doesn't exist yet and a thing that was removed are both drift. Narratives that age ("fine at current traffic", "X is installed") are drift candidates.
   - **Rule**: a guide holds steps and facts. A statement the code can violate ("must", "never", a criterion every change satisfies) belongs in `docs/standards/` or an ADR, and the guide points to it.
   - **Agreement**: no conflict with an accepted ADR, a standard, or `AGENTS.md`; every cross-reference link resolves; every guide has a trigger in the `AGENTS.md` guides list, and every trigger names an existing guide.
   - **Contract**: a guide that a skill reads (issue tracker, triage labels, ...) supplies what that skill expects: the sections, labels and operations it asks for. Check each `gh` command and API endpoint against `gh ... --help` and the skill's text.
   - **Source of truth**: a guide points at config or code instead of copying it, because a copy is a cache that goes stale. A copy is justified only when the lookup is expensive or the value is a gotcha no config confesses.
   - **Leftovers**: template text, placeholders, instructions for the guide's own author, and sections that no step or reader uses.

4. Fix what is unambiguous: drift, broken links and paths, leftovers, rules moved out to a standard (with the standard's `AGENTS.md` trigger intact). Ask the user, with a recommendation, about every item that adds, changes or removes a rule, changes a documented workflow, or needs a code or tooling change to make a guide work. Done when the user has decided every open item.

5. Apply the decisions. Done when re-running step 3 on the changed guides yields no findings.

6. Run the Definition of Done in `AGENTS.md`. Start any service the tests need and stop what you started afterwards. Done when every phase passes.

7. Report what changed and what was decided. Commit only after the user approves, in logical groups (docs, code), using Conventional Commits.
