# Design System

This project uses a design system defined in DESIGN.md.

For all UI work:
- Read DESIGN.md before generating any component or style
- Use the color tokens exactly as specified. No custom hex values.
- Apply the type scale to all text elements
- Use the spacing scale for margins, padding, and gaps
- Do not introduce new design decisions without a reason

## Setup status

Tailwind CSS v4 and Shadcn UI are **installed and configured**:
- Tailwind v4 is wired via `@tailwindcss/vite` in `apps/web/vite.config.ts`
- All DESIGN.md tokens are defined as CSS custom properties in `apps/web/src/styles.css` under `@theme`
- The path alias `@/*` → `src/*` is set in `tsconfig.json` and `vite.config.ts`
- Shadcn UI components live in `src/components/ui/`; the `cn()` utility is at `src/lib/utils.ts`

## Token naming convention

| DESIGN.md reference | CSS custom property |
|---|---|
| `{colors.primary}` | `var(--color-primary)` |
| `{spacing.base}` | `var(--spacing-base)` |
| `{rounded.sm}` | `var(--radius-sm)` |
| `{typography.body-md}` | `var(--text-body-md)` |

Always apply tokens via `style={{ ... }}` or Tailwind utilities — never hardcode hex values or pixel sizes.