# AGENTS.md

## Tech Stack

- **frontend framework**: React (SPA/CSR)
- **programming language**: TypeScript
- **localization**: i18next + react-i18next
- **routing**: TanStack Router (type-safe, file-based)
- **server state**: TanStack Query
- **client ui state**: Zustand
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

- **guides** (`docs/guides/`): how-to guides for codebase workflows
- **standards** (`docs/standards/`): codebase rules every change must follow
- **references** (`docs/references/`): production readiness and non-functional requirements checklists
- **glossary** (`glossary/`): business and technical terms (created or updated using /glossary skill)
- **specifications** (`openspec/`): required product behavior in `specs/` and proposed changes in `changes/` (created or updated using /openspec-* skills)
- **ADRs** (`docs/adr/`): accepted architecture and design decisions (created or updated using /architectural-decision-records skill)

### Guides

- **issue tracker**: when creating, reading, updating, or triaging an issue or PR, read `docs/guides/issue-tracker.md` first
- **triage labels**: when applying a triage label, read `docs/guides/triage-labels.md` first
- **ADRs**: when creating or updating an ADR, read `docs/guides/adrs.md` first
- **E2E tests**: when running or debugging E2E tests (Playwright), read `docs/guides/e2e-tests.md` first
- **observability**: when verifying instrumentation or setting up Sentry alerts, read `docs/guides/observability.md` first
- **deployment**: when touching `vercel.json`, build/deploy config, or debugging a deploy, read `docs/guides/deployment.md` first

### Standards

- **project structure**: when adding, moving, or renaming files, read `docs/standards/project-structure.md` first
- **design system**: when creating or modifying UI (components, pages, layouts, styles), read `docs/standards/design-system.md` first
- **testing**: when adding or editing a test (unit, integration, or E2E), or test configuration, read `docs/standards/testing.md` first
- **security**: when adding or editing a Supabase migration (tables, RLS policies), read `docs/standards/security.md` first
- **observability**: when adding a Supabase call, a new route, or a background/retry path, read `docs/standards/observability.md` first

## General Rules

- Must use Conventional Commits when creating commit messages
- Must use Conventional Branch when creating branches
- Must use /pr skill when writing a PR body
- Must read ADRs in `docs/adr/` that touch the area you're about to work in before exploring the codebase for a task

### Definition of Done

Execute phases in sequence before concluding any change to the codebase (feature, bug fix, or refactor).

#### Phase 1: Standards

- Check code against `docs/standards/` files. Align code to comply with the standards.

#### Phase 2: ADRs

- Check code against `docs/adr/` files. Align code to comply with the architecture decisions.

#### Phase 3: Automated Verification

- Run `npm run typecheck` (must pass 0 errors).
- Run `npm run lint` (must pass 0 errors).
- Run `npm run spec:validate` (must pass 0 errors).
- Run `npm run build` (must pass clean).
- Run `npm run test:all` (must pass 100%).
- _Self-correction:_ On error, parse stderr, fix code, and retry until clean.

#### Phase 4: Test Audit

Inspect newly added or modified test files only.

- Validate tests have non-trivial assertions (no `expect(true).toBe(true)` or empty blocks).
- Ensure unit under test is not mocked out (mock external I/O only).
- Confirm zero skipped tests (`it.skip`/`describe.skip`).

#### Phase 5: Definition of Done Final Report

Output concise status:

- Standards: [OK / NOK]
- ADRs: [OK / NOK]
- Typecheck: [OK / NOK]
- Lint: [OK / NOK]
- Spec Validation: [OK / NOK]
- Build: [OK / NOK]
- Test Audit: [OK / NOK]
