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
- Tailwind v4 is wired via `@tailwindcss/vite` in `vite.config.ts`
- DESIGN.md tokens and typography primitives live in `src/styles/globals.css`
- `src/styles/globals.css` owns both the Tailwind theme tokens and the app-level base styles because the project only has one frontend surface
- The path alias `@/*` → `src/*` is set in `tsconfig.json` and `vite.config.ts`
- Shadcn UI components live in `src/ui/`; the `cn()` utility is at `src/lib/utils.ts`

## Token naming convention

| DESIGN.md reference | CSS custom property |
|---|---|
| `{colors.primary}` | `var(--color-primary)` / `text-primary` / `bg-primary` |
| `{spacing.base}` | `var(--spacing-base)` / `px-base` / `gap-base` |
| `{rounded.sm}` | `var(--radius-sm)` / `rounded-sm` |
| `{typography.body-md}` | `var(--text-body-md)` / `text-body-md` / `type-body-md` |

Prefer Tailwind classes backed by the theme tokens. Inline `style={{ ... }}` is only acceptable when a CSS property cannot be expressed cleanly with Tailwind utilities or the shared typography primitives.

## Typography primitives

Reusable typography classes are defined in `src/styles/globals.css`:

- `type-display-xl`
- `type-display-sm`
- `type-body-md`
- `type-caption`
- `type-caption-sm`
- `type-nav-link`

Use them instead of repeating font size, weight, line-height, and tracking in component files.

## Dark mode

Dark mode is **not currently supported**. Do not add `dark:*` classes or dark-theme token overrides until the product explicitly adopts a dark theme.

## Validation

Always validate the DESIGN.md file for structural correctness using `npx @google/design.md lint DESIGN.md` after making changes to it.