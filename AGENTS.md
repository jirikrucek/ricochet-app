# Ricochet App

The app is used to keep track of players and organize tournaments in a racket sport called ricochet.

## Rules
- ALWAYS use Conventional Commits when creating commit messages
- ALWAYS use Conventional Branch when creating branches
- ALWAYS save information intended for app users in README.md, and information intended for AI agents in AGENTS.md
- ALWAYS run unit, integration, and end-to-end (E2E) tests after finishing your work to ensure that nothing in the app has broken
- NEVER automatically commit changes. It is up to the user to commit changes manually.

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

This project uses a design system defined in DESIGN.md.

For all UI work:
- Read DESIGN.md before generating any component or style
- Use the color tokens exactly as specified. No custom hex values.
- Apply the type scale to all text elements
- Use the spacing scale for margins, padding, and gaps
- Do not introduce new design decisions without a reason

#### Setup status

Tailwind CSS v4 and Shadcn UI are **installed and configured**:
- Tailwind v4 is wired via `@tailwindcss/vite` in `apps/web/vite.config.ts`
- All DESIGN.md tokens are defined as CSS custom properties in `apps/web/src/styles.css` under `@theme`
- The path alias `@/*` → `src/*` is set in `tsconfig.json` and `vite.config.ts`
- Shadcn UI components live in `src/components/ui/`; the `cn()` utility is at `src/lib/utils.ts`

#### Token naming convention

| DESIGN.md reference | CSS custom property |
|---|---|
| `{colors.primary}` | `var(--color-primary)` |
| `{spacing.base}` | `var(--spacing-base)` |
| `{rounded.sm}` | `var(--radius-sm)` |
| `{typography.body-md}` | `var(--text-body-md)` |

Always apply tokens via `style={{ ... }}` or Tailwind utilities — never hardcode hex values or pixel sizes.