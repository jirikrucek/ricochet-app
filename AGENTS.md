# Ricochet App

The app is used to keep track of players and organize tournaments in a racket sport called ricochet.

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

## Dev Tools

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

### Phase 1: Architecture
- Check code against relevant `docs/adr/` files. Align code to comply with rules.

### Phase 2: Standards
- Check code against relevant `docs/agents/` files. Align code to comply with rules.

### Phase 3: Automated Verification
- Run `npm run typecheck` (must pass 0 errors).
- Run `npm run build` (must pass clean).
- Run `npm run test:all` (must pass 100%).
- *Self-correction:* On error, parse stderr, fix code, and retry until clean.

### Phase 4: Anti-Ghost Test Audit
- Inspect newly added or modified test files only.
- Validate new tests have non-trivial assertions (no `expect(true).toBe(true)` or empty blocks).
- Ensure unit under test is not mocked out (mock external I/O only).
- Confirm zero skipped tests (`it.skip`/`describe.skip`).

### Phase 5: Definition of Done Final Report
Output concise status:
- ADR: [OK / NOK]
- Standards: [OK / NOK]
- Typecheck: [OK / NOK]
- Build: [OK / NOK]
- Tests & Anti-Ghost Audit: [OK / NOK]

## Agent skills

### Issue tracker

GitHub Issues are the tracking system for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The default triage vocabulary is `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context layout with one root CONTEXT file and ADRs under docs/adr. See `docs/agents/domain.md`.

### Design system

When creating or modifying ANY UI (components, pages, layouts, styles), read and follow `DESIGN.md` - the design system source of truth for colors, typography, spacing, radii, elevation, and component rules. Use its semantic tokens; never hardcode hex/px values that bypass them. Tailwind theme tokens and typography primitives live in `apps/web/src/styles.css`. See `docs/agents/design-system.md`.

### Deployment

This repository is deployed to Vercel. See `docs/agents/deployment.md`.