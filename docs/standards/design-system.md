# Design System

This project uses a design system defined in DESIGN.md.

For all UI work:
- Use the color tokens exactly as specified in DESIGN.md. No custom hex values.
- Apply the type scale to all text elements
- Use the spacing scale for margins, padding, and gaps
- Do not introduce new design decisions without a reason

## Vendored artwork

The "no custom hex values" rule governs UI styling. Vendored artwork rendered as an image keeps its intrinsic colours inside the asset file: the brand logo (`src/assets/brand/`), the favicon (`public/favicon.svg`) and the flag SVGs (`src/assets/flags/`). Don't map those fills to tokens, and don't reuse their hex values in component styles. See [ADR 0008](../adr/ADR0008-vendored-brand-artwork-keeps-its-own-colours.md).

## Where things live

- The DESIGN.md tokens, the typography primitives and the app-level base styles live in `src/styles/globals.css`, the only stylesheet (the project has one frontend surface).
- Shadcn UI components live in `src/ui/`; the `cn()` utility is in `src/lib/utils.ts`.
- The path alias `@/*` → `src/*` is set in `tsconfig.json` and `vite.config.ts`.

## Token naming convention

| DESIGN.md reference | CSS custom property |
|---|---|
| `{colors.primary}` | `var(--color-primary)` / `text-primary` / `bg-primary` |
| `{spacing.base}` | `var(--spacing-base)` / `px-base` / `gap-base` |
| `{rounded.sm}` | `var(--radius-sm)` / `rounded-sm` |
| `{typography.body-md}` | `var(--text-body-md)` / `text-body-md` / `type-body-md` |

Prefer Tailwind classes backed by the theme tokens. Inline `style={{ ... }}` is only acceptable when a CSS property cannot be expressed cleanly with Tailwind utilities or the shared typography primitives.

## Typography primitives

Reusable `type-*` classes (for example `type-body-md`, `type-caption`) are defined in `src/styles/globals.css`. Use them instead of repeating font size, weight, line-height, and tracking in component files. Add a new primitive there when a text style repeats; don't define it in a component.

## Dark mode

Dark mode is **not currently supported**. Do not add `dark:*` classes or dark-theme token overrides until the product explicitly adopts a dark theme.

## DESIGN.md

DESIGN.md is the source of the tokens. After changing it, it must pass `npx @google/design.md lint DESIGN.md`, and `src/styles/globals.css` must match it.