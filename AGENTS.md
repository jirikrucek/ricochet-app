# AGENTS.md

## Tech Stack

- frontend framework: React (SPA/CSR)
- programming language: TypeScript
- localization: i18next + react-i18next
- routing: TanStack Router (type-safe, file-based)
- server state: TanStack Query
- client ui state: Zustand
- form state management and validation: React Hook Form + Zod
- table and virtualization: TanStack Table (+ TanStack Virtual when needed)
- design system and styling: Shadcn UI + Tailwind CSS + CSS design tokens
- backend platform: Supabase (PostgreSQL, Auth, Realtime, RLS)
- hosting: Vercel

## Tool Stack

- package manager: npm
- build tool: Vite
- unit and integration testing: Vitest
- e2e testing: Playwright
- static analysis: ESLint
- code formatting: Prettier
- spec driven development: OpenSpec

## Rules

- Must use Conventional Commits when creating commit messages
- Must use Conventional Branch when creating branches

### Definition of Done

Execute phases in sequence before concluding any change to the codebase (feature, bug fix, or refactor).

#### Phase 1: Standards
- Check code against relevant `docs/standards/` files. Align code to comply with the standards.

#### Phase 2: ADRs
- Check code against relevant `docs/adr/` files. Align code to comply with the architecture decision records.

#### Phase 3: Automated Verification
- Run `npm run typecheck` (must pass 0 errors).
- Run `npm run build` (must pass clean).
- Run `npm run test:all` (must pass 100%).
- *Self-correction:* On error, parse stderr, fix code, and retry until clean.

#### Phase 4: Anti-Ghost Test Audit
- Inspect newly added or modified test files only.
- Validate new tests have non-trivial assertions (no `expect(true).toBe(true)` or empty blocks).
- Ensure unit under test is not mocked out (mock external I/O only).
- Confirm zero skipped tests (`it.skip`/`describe.skip`).

#### Phase 5: Definition of Done Final Report
Output concise status:
- Standards: [OK / NOK]
- ADRs: [OK / NOK]
- Typecheck: [OK / NOK]
- Build: [OK / NOK]
- Tests & Anti-Ghost Audit: [OK / NOK]

## Standards

### Design system

When creating or modifying UI (components, pages, layouts, styles), read `docs/standards/design-system.md` first.

### Project structure

When adding, moving, or renaming files, read `docs/standards/project-structure.md` first.

## Playbooks

### Issue tracker

When creating, reading, updating, or triaging an issue or PR, use the `gh` CLI per `docs/agents/issue-tracker.md`.

### Triage labels

When applying a triage label, use one of: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Full mapping in `docs/agents/triage-labels.md`.

### Domain docs

Before exploring the codebase for a task, read `docs/agents/domain.md` for how to consult `CONTEXT.md` and `docs/adr/`.

### Deployment

When touching `vercel.json`, build/deploy config, or debugging a deploy, read `docs/agents/deployment.md`.