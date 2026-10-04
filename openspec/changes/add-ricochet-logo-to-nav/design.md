## Context

See proposal.md (Why) for motivation and `specs/app-shell/{branding,navigation}/spec.md` for the required behaviour. This document records only the constraints and choices that shape the implementation.

Current state:

- `src/app/layout/TopNav.tsx` renders one fixed three-column grid (`grid-cols-[1fr_auto_1fr]`) at every width: an inline placeholder SVG plus the text "Ricochet", the Players and Tournaments links, and `LanguageSelect` in a 160px (`w-40`) box. It has no responsive variants, so at phone width the row can't fit.
- `TopNav` lives in the `app` boundary, which may import only `ui`, `localization` and `lib` (enforced by `eslint-plugin-boundaries`).
- `src/ui/` currently contains only `select.tsx`. The Shadcn style is `base-nova`, so primitives are built on `@base-ui/react` (already a dependency). `lucide-react` is already the icon library.
- Precedent for vendored artwork: the flag SVGs in `src/assets/flags/` are imported as URLs and rendered as decorative `<img alt="" aria-hidden>` elements (ADR 0006).
- DESIGN.md defines the mobile breakpoint as `< 744px` and 48×48px minimum touch targets. Tailwind's default `md` breakpoint is 768px, and `globals.css` defines no breakpoint tokens. Spacing tokens include `xl` (32px) and `xxl` (48px). The nav height is 80px.
- Vitest configs only collect `*.test.ts` files in a Node environment: there is no jsdom or `.tsx` component-test setup. Playwright runs one Desktop Chrome project (1280px), and every existing e2e test drives `#language-trigger` at that width.
- The source logo is a 1186×388 PNG (≈3.06:1) with flat colours: brand grey ≈ `#808285`, red ≈ `#C1121F` (sampled exactly from flat interior pixels during implementation: `#818286` and `#c3121a`), and a white background. It includes a ® mark at the top right, which this change drops. The repo has no raster-tracing tooling.

## Goals / Non-Goals

**Goals:**

- Produce a clean, hand-reviewable SVG of the logo that is visually indistinguishable from the PNG at nav size, uses exact sampled brand colours, and has a transparent background.
- Make the phone/desktop switch CSS-driven, so there is no layout flash or JS measurement on load.
- Reuse Base UI's dialog behaviour (focus trap, Escape, outside click, focus return) rather than hand-rolling it.
- Keep every existing desktop e2e test passing unchanged.

**Non-Goals:**

- A reusable `<Logo>` component or a brand asset pipeline. There is one usage site.
- PNG or ICO favicon fallbacks.
- Component-level (jsdom) test infrastructure. Behaviour is verified end to end instead (see D9).

## Decisions

### D1. Vectorise by tracing per colour layer, then rebuild the geometric parts by hand

Split the PNG into its two colour layers (grey and red) and trace each with `potrace`, run through a throwaway script in the session scratchpad (`npx` / a temporary install, **not** added to `package.json`). Then hand-replace the parts that are true geometry: the red ring becomes two concentric `<circle>`s (or a single `fill-rule="evenodd"` path). Erase the ® mark (top right) from the source before tracing, so it never enters the SVG. Minify with `svgo` (also run ad hoc). Crop the `viewBox` tightly to the wordmark's bounds, so removing the ® leaves no empty space on the right; the final aspect ratio is measured from that crop. Drop the white background so the logo sits on any surface. Sample the fill colours from the PNG's flat interior pixels.

- *Alternative: fully hand-drawn SVG.* Rejected: the italic block lettering and motion strokes are hard to reproduce faithfully by hand.
- *Alternative: raw auto-trace only.* Rejected: it produces wobbly circles and bloated paths, and the ring is the brand's focal point.
- *Alternative: embed the PNG inside an `<svg>`.* Rejected: that isn't a vector, and violates the spec's "stays sharp" requirement.
- **Fidelity check (one-off, not committed):** render the SVG in Playwright's Chromium at the same scale as the PNG, diff it against the PNG cropped to the same bounds with the ® erased, and review the overlay visually before committing.

### D2. Render the logo as an `<img>` of a bundled SVG inside the home link

Import `src/assets/brand/ricochet-logo.svg` as a URL (as the flags do) and render `<img src={logo} alt="" aria-hidden="true">` inside the `Link to="/"`. The link gets `aria-label="Ricochet"`. The brand name is a hard-coded constant, not an i18n key: it must be identical in every language (spec: "Brand name is not translated"), and six identical locale entries would only invite accidental translation.

- *Alternative: `<img alt="Ricochet">` without an `aria-label`.* Viable, but some screen readers then announce "link, graphic, Ricochet". The spec requires that the artwork is not announced separately.
- *Alternative: inline SVG via `vite-plugin-svgr`.* Rejected: a new build dependency for no behavioural gain. An `<img>` also isolates the brand fills from the page's CSS cascade.

### D3. Brand colours stay inside the SVG; record the exception in an ADR

The SVG carries literal brand hex fills. To reconcile this with the design-system rule "No custom hex values", add a short "Vendored artwork" note to `docs/standards/design-system.md`: the token rule governs UI styling, while vendored brand and flag artwork keeps its intrinsic colours. Record the decision in `docs/adr/0008-vendored-brand-artwork-keeps-its-own-colours.md`, citing ADR 0006's flags as precedent.

- *Alternatives considered (mapping to the nearest tokens, or adding brand tokens):* both were rejected with the user during proposal review.

### D4. Fixed logo height of 32px (`h-xl`) at every width

Render the image at `h-xl w-auto` (32px tall, ≈110.5px wide once the ® is cropped away; the traced `viewBox` is 1081×313). This keeps the logo visually balanced against the 16px nav links in the 80px bar. At 320px the collapsed row needs at most 16px gutter + 111px logo + 48px button + 16px gutter ≈ 191px, which fits comfortably, so no shrinking logic is needed. Add `shrink-0` to the image and `min-w-0` to the link as a guard against squashing.

- *Alternative: 48px (`h-xxl`, ≈166px wide).* Rejected: it dominates the bar and crowds the centred links at 744px.
- *Alternative: a responsive height.* Unnecessary given the width budget above.

### D5. Favicon: a hand-authored ring-mark SVG in `public/`

Create `public/favicon.svg` (the project-structure standard places the favicon in `public/`, served verbatim) containing only the red ring, built from the same circle geometry as D1 and padded inside a square `viewBox`. Reference it from `index.html` with `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`. The grey "C" and the motion strokes are omitted because they turn to mush at 16px.

- *Alternative: a Vite-processed asset referenced from `index.html`.* It works, but contradicts the standard's explicit placement.
- *Alternative: also ship `.ico`/PNG fallbacks.* Out of scope (proposal), see the risks below.

### D6. CSS-driven collapse with a named `tablet` breakpoint token

Add `--breakpoint-tablet: 744px;` to the `@theme` block in `globals.css`, which gives a `tablet:` variant. `TopNav` renders both arrangements, and CSS picks one:

- Below `tablet`: a flex row with the logo at the start and the menu trigger at the end (`tablet:hidden`).
- From `tablet` up: the existing three-column grid with the centred links and the language selector (`hidden tablet:grid`).

The logo link is rendered once and shared by both arrangements, so there is only one "Ricochet" link in the accessibility tree.

- *Alternative: override `--breakpoint-md` to 744px.* Rejected: it silently changes the meaning of a standard Tailwind name.
- *Alternative: arbitrary `min-[744px]:` variants.* Rejected: they scatter a magic number around the code.
- *Alternative: a JS `matchMedia` hook choosing which tree to render.* Rejected: it causes a flash of the wrong layout and makes resize handling more fragile.

### D7. Menu built on a Shadcn `sheet` (Base UI Dialog), controlled by `TopNav`

Add the `sheet` primitive with `npx shadcn@latest add sheet`, which puts it in `src/ui/` (plus `button` if the registry requires it). The sheet opens from the right (the trigger's side), is at most 320px wide, and contains a title ("Menu"), the two section links stacked using the same active-state styling, and a `LanguageSelect` with `id="language-menu-trigger"` and a visible label. The id must differ from the desktop selector's `#language-trigger`, which stays in the DOM, hidden.

- The open state is a `useState` in `TopNav` (local UI state; it doesn't need Zustand). Section links call `setOpen(false)` on click, which also covers tapping the current page's link.
- If the viewport crosses into `tablet` while the menu is open, a `matchMedia('(min-width: 744px)')` change listener closes it, so no orphaned overlay or scroll lock remains over the desktop layout.
- The trigger is a 48×48px (`size-xxl`) button with a lucide `MenuIcon` and a localized `aria-label`. New `nav.openMenu`, `nav.closeMenu` and `nav.menuTitle` keys are added to all six locale files; typecheck enforces parity with `en`.
- Base UI Dialog supplies the focus trap, Escape and outside-click dismissal, focus return to the trigger, and `aria-expanded` on the trigger.
- The primitive's built-in close button is disabled (`showCloseButton={false}`) because its label is hard-coded in English. `TopNav` renders its own `SheetClose` with `aria-label={t('nav.closeMenu')}`, at the same 48×48px size as the trigger.
- `NavLink` puts the active styles in `activeProps` and the inactive styles (`border-transparent text-muted`) in `inactiveProps`, never both in the base `className`. When both sets sit on the element at once, the base muted/transparent utilities win the cascade, so no active state is visible. This also gives the desktop nav a visible active state (see proposal).
- *Alternative: a hand-rolled disclosure panel.* Rejected: it re-implements focus trapping and dismissal, which are the spec's accessibility requirements.
- *Alternative: a dropdown menu primitive.* Rejected: a `menu` role doesn't fit a language `<select>` nested inside it.

### D8. Placeholder Players and Tournaments routes as prefactoring

`TopNav` already links to `/players` and `/tournaments`, but only `/` exists. Add file-based routes `src/routes/players/index.tsx` and `src/routes/tournaments/index.tsx`, each rendering just an `<h1>` with the existing `nav.players` / `nav.tournaments` translation and the same heading styles as `routes/index.tsx`. Routes use `react-i18next` directly, as `index.tsx` does, which the `routes` boundary allows. No observability work is needed: the routes have no data loading, and `browserTracingIntegration` already traces route changes. With real routes, `Link` active state and navigation can be tested against actual pages.

- *Alternative: test against the router's default not-found rendering.* Rejected with the user as fragile.

### D9. Verification through Playwright at explicit viewports

Add `tests/e2e/app-shell/branding.spec.ts` and `tests/e2e/app-shell/navigation.spec.ts`. Each test calls `page.setViewportSize` for its scenario's width (320, 375, 743, 744, 1280). The assertions are:

- the link is reachable by role and name (`getByRole('link', { name: 'Ricochet' })`);
- the logo `<img>` has loaded, its `src` is an SVG, and its rendered aspect ratio matches the SVG `viewBox` ratio (no stretching);
- there is no horizontal overflow (`documentElement.scrollWidth <= innerWidth`);
- the menu button's name in English and Czech, and its `aria-expanded` state;
- navigation and Escape/outside-click dismissal with focus return, plus the focus trap via Tab;
- language switching from the sheet;
- the favicon `<link>` resolves to `200` with `image/svg+xml`.

No Vitest test is added: `TopNav` is pure composition with no logic to unit-test, and its behaviour depends on real CSS breakpoints, which jsdom doesn't evaluate. The existing desktop language-selection e2e tests are kept unchanged as a regression guard.

## Risks / Trade-offs

- [The traced logo differs subtly from the PNG] → D1's rendered diff plus a manual overlay review before commit. The geometric parts are hand-built rather than traced.
- [Some older browsers (e.g. Safari before SVG favicon support) don't show an SVG favicon] → Accepted per the proposal's scope. Those browsers fall back to their default icon. A PNG fallback can be added later without changing the spec.
- [Base UI Dialog's trigger doesn't expose `aria-expanded` as assumed] → The e2e check catches it. If so, set `aria-expanded={open}` explicitly on the trigger.
- [Two `LanguageSelect` instances drift apart] → Both render the same component from `localization/`, differing only in `id`, size and label visibility.
- [The literal hex fills in the SVG trip a future lint or stylelint rule] → The rule's scope is UI styling, and the ADR and standard note make the exception explicit. SVG assets aren't linted today.

## Migration Plan

This is a frontend-only change, with no data, configuration or environment changes. It deploys with the normal Vercel build. To roll back, revert the merge commit. The new `public/` directory and favicon simply disappear, and browsers fall back to the default icon.
