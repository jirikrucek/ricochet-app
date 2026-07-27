# Ricochet App

The app is used to keep track of players and organize tournaments in a racket sport called ricochet.

## Rules

- ALWAYS use Conventional Commits when creating commit messages
- ALWAYS use Conventional Branch when creating branches
- ALWAYS save information intended for app users in README.md, and information intended for AI agents in AGENTS.md
- ALWAYS run unit, integration, and end-to-end (E2E) tests after finishing your work to ensure that nothing in the app has broken

## Dev Tools

- package manager: npm
- build tool: Vite
- unit and integration testing: Vitest
- e2e testing: Playwright
- static analysis: ESLint
- code formatting: Prettier
- spec driven development: OpenSpec

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

## Agent skills

### Issue tracker

GitHub Issues are the tracking system for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The default triage vocabulary is `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context layout with one root CONTEXT file and ADRs under docs/adr. See `docs/agents/domain.md`.

### Design system

When creating or modifying ANY UI (components, pages, layouts, styles), read and follow `DESIGN.md` - the design system source of truth for colors, typography, spacing, radii, elevation, and component rules. Use its semantic tokens; never hardcode hex/px values that bypass them. Tailwind theme tokens and typography primitives live in `apps/web/src/styles.css`. See `docs/agents/design-system.md`.
