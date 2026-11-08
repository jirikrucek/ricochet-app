# AGENTS.md

## Tech Stack

- **frontend framework**: React (SPA/CSR)
- **programming language**: TypeScript
- **localization**: i18next + react-i18next
- **routing**: TanStack Router (type-safe, file-based)
- **server state**: TanStack Query
- **form state management and validation**: React Hook Form + Zod
- **design system and styling**: Shadcn UI + Tailwind CSS + CSS design tokens
- **backend platform**: Supabase (PostgreSQL, Auth, Realtime, RLS)
- **hosting**: Vercel

## Tool Stack

- **package manager**: npm
- **build tool**: Vite
- **unit and integration testing**: Vitest
- **e2e testing**: Playwright
- **static analysis**: ESLint
- **code formatting**: Prettier
- **spec driven development**: OpenSpec

## Docs

- **guides** (`docs/guides/`): how-to guides for codebase tasks
- **standards** (`docs/standards/`): codebase rules every change must follow
- **references** (`docs/references/`): production readiness and non-functional requirements checklists
- **glossary** (`glossary/`): business and technical terms (created or updated using /glossary skill)
- **specifications** (`openspec/`): required product behavior in `specs/` and proposed changes in `changes/` (created or updated using /openspec-* skills)
- **ADRs** (`docs/adr/`): architecture and design decisions, indexed with their status in `docs/adr/README.md`

### Guides

- **issue tracker**: when creating, reading, updating, or triaging an issue or PR, read `docs/guides/issue-tracker-guide.md` first
- **triage labels**: when applying a triage label, read `docs/guides/triage-labels-guide.md` first
- **ADRs**: when deciding whether a decision needs an ADR, or writing, editing, or superseding one, read `docs/guides/adrs-guide.md` first
- **testings**: when running or debugging tests, read `docs/guides/testing-guide.md` first
- **observability**: when verifying instrumentation or setting up Sentry alerts, read `docs/guides/observability-guide.md` first
- **deployment**: when touching `vercel.json`, build/deploy config, or debugging a deploy, read `docs/guides/deployment-guide.md` first

### Standards

- **project structure**: when adding, moving, or renaming files, read `docs/standards/project-structure-standard.md` first
- **design system**: when creating or modifying UI (components, pages, layouts, styles), read `docs/standards/design-system-standard.md` first
- **testing**: when adding or editing a test (unit, integration, or E2E), or test configuration, read `docs/standards/testing-standard.md` first
- **security**: when adding or editing a Supabase migration (tables, RLS policies), read `docs/standards/security-standard.md` first
- **observability**: when adding a Supabase call, a new route, or a background/retry path, read `docs/standards/observability-standard.md` first
- **list filters**: when adding or changing filters on a list, read `docs/standards/list-filters-standard.md` first

## Workflows

Skills marked _(human only)_ start only when a human types the slash command: an agent that reaches one names the command to the user and waits.

### Change Workflow

Every change to the repository follows this path: features, bug fixes and refactors, and also dependency updates, tooling config and docs-only edits. Those last three have no OpenSpec change, so they skip the steps marked _(OpenSpec)_. When the idea is still fuzzy, run `/openspec-explore` first, until you can name what changes.

Each step ends on its **done when**; finish it before moving on. A human or an agent may do any step, as the human prefers, except those marked _(human only)_.

The issue's **workflow checklist** is the record of where the change stands. Before each step, read it and take its first unticked line. When a step's done-when holds, tick its line and append a one-line note of the evidence, e.g. `- [x] 6. **Verify**: 0 CRITICAL, [report](<comment URL>)`. The human ticks the lines of _(human only)_ steps.

1. **Issue**: find the issue the change resolves, or create one. Post the workflow checklist on it as one comment headed `## Workflow checklist`: a `- [ ] N. **Step**` line per step of this list, numbered as here, leaving out the _(OpenSpec)_ steps when the change has none. Done when the checklist comment is on the issue.
2. **Branch**: create a Conventional Branch off `main`. Done when `HEAD` is on the new branch.
3. **Create change** _(OpenSpec)_: run `/openspec-new-change`. Done when `openspec/changes/<name>/` exists.
4. **Plan** _(OpenSpec)_: run `/openspec-continue-change` once per planning artifact, or `/openspec-ff-change` to create them all in one pass. Done when `openspec status --change <name>` shows every artifact complete.
5. **Implement**:
   - _OpenSpec change_: run `/openspec-apply-change`. When the plan turns out wrong mid-way, revise it with `/openspec-update-change` and resume. Done when every task in `tasks.md` is checked.
   - _Other change_: make the edits. For code or config edits, run `/code-health` and fix its critical findings. Then run the Definition of Done. Done when its final report shows every line OK.
6. **Verify** _(OpenSpec)_: run `/openspec-verify-change`, and re-run the Definition of Done after any code change it leads to. Post its final report on the issue as a comment, and link that comment in the checklist note. Done when the report shows no CRITICAL issues and is on the issue.
7. **Pull request**: commit, then write the body with `/pr`. Done when the PR is open against `main` and its checks pass.
8. **Review** _(human only)_: review the PR and request changes. Address each one, re-running Verify _(OpenSpec)_, with a fresh report on the issue, and the Definition of Done after any code change. Done when the PR is approved.
9. **Archive** _(OpenSpec)_: run `/openspec-archive-change`, then commit and push to the PR branch. Post its final report on the issue as a comment, and link that comment in the checklist note. Done when the change sits under `openspec/changes/archive/`, its delta specs are merged into `openspec/specs/`, `npm run spec:validate` passes on the merged specs, the PR checks pass again, and the report is on the issue.
10. **Merge** _(human only)_: merge the PR into `main`. Done when the PR shows as merged.

### Maintenance

| Workflow             | Skill                                                                      | Reach for it when                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Diagnose a bug       | `/diagnosing-bugs`                                                         | something is broken, failing, or got slower and the cause is unclear; the fix then enters the change workflow                              |
| Optimize performance | `/performance-optimization`                                                | a page or query misses a performance target (Core Web Vitals, a budget in the spec); measure first, and the fix enters the change workflow |
| Improve architecture | `/improve-codebase-architecture` _(human only)_                            | you want a visual report of which modules are worth deepening first                                                                        |
| Audit                | `/audit` _(human only)_                                                    | you want to sweep the codebase for violations of standards and accepted ADRs, fix the approved ones, and commit                            |
| Validate docs        | `/validate-adrs`, `/validate-guides`, `/validate-standards` _(human only)_ | you changed `docs/adr/`, `docs/guides/`, or `docs/standards/`, or want to check they still hold                                            |

### Research

| Workflow  | Skill        | Reach for it when                                                      |
| --------- | ------------ | ---------------------------------------------------------------------- |
| Research  | `/research`  | you need a cited answer from primary sources, saved as Markdown        |
| Prototype | `/prototype` | a design question is cheaper to answer with throwaway code than debate |
| Grilling  | `/grilling`  | you want a plan or decision stress-tested before you commit to it      |

### Sessions and Harness

| Workflow         | Skill                     | Reach for it when                                                                       |
| ---------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| Hand-off         | `/handoff` _(human only)_ | a long session should continue in a fresh agent                                         |
| Retrospective    | `/retro` _(human only)_   | a session is over and you want to improve skills, docs, or `AGENTS.md` for the next one |
| Write for agents | `/writing-for-agents`     | you create or edit a skill, `AGENTS.md`, or any doc agents read                         |

## Rules

- Must use English language when authoring
- Must use Conventional Commits when creating commit messages
- Must use Conventional Branch when creating branches
- Must use /pr skill when writing a PR body
- Must read the accepted ADRs (see `docs/adr/README.md`) that touch the area you're about to work in before exploring the codebase for a task

### Definition of Done

Execute phases in sequence before concluding any change to the codebase (feature, bug fix, or refactor).

#### Phase 1: Standards

- Check every changed file against each standard whose trigger in the Standards list above matches the change, and fix every violation. Done when every rule of those standards holds for the change.

#### Phase 2: ADRs

- Check every changed file against the accepted ADRs (see `docs/adr/README.md`) that touch its area, and fix every violation. Done when the change follows each of them. If the change needs to depart from an accepted ADR, stop and ask the user: the departure is a new ADR that supersedes it.

#### Phase 3: Automated Verification

- Run `npm run typecheck` (must pass 0 errors).
- Run `npm run lint` (must pass 0 errors).
- Run `npm run spec:validate` (must pass 0 errors).
- Run `npm run design:lint` (must pass 0 errors).
- Run `npm run build` (must pass clean).
- Run `npm run test:all` (must pass 100%).
- _Self-correction:_ On error, parse stderr, fix code, and retry until clean.

#### Phase 4: Definition of Done Final Report

Output concise status:

- Standards: [OK / NOK]
- ADRs: [OK / NOK]
- Typecheck: [OK / NOK]
- Lint: [OK / NOK]
- Spec Validation: [OK / NOK]
- Design Lint: [OK / NOK]
- Build: [OK / NOK]
- Tests: [OK / NOK]
