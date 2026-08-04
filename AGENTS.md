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

### Testing

This repository uses Vitest for unit and integration testing in the web app workspace.

Run tests from the repository root:

- `npm run test` for watch mode.
- `npm run test:run` for a one-off full run.
- `npm run test:unit` for unit tests.
- `npm run test:integration` for integration tests.

## Rules

- Must use Conventional Commits when creating commit messages
- Must use Conventional Branch when creating branches
- Must run unit, integration, and end-to-end (E2E) tests using `npm run test:all` after any changes in the codebase to ensure that nothing in the app has broken
- Must update documentation in `docs/` after any changes in the codebase

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