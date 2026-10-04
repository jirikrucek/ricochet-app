## Why

The top nav bar identifies the app with a placeholder: a generic red-ring glyph next to the plain text "Ricochet" in the display font. The product has an official Ricochet logo, but the app doesn't show it anywhere. The browser tab also has no favicon. Using the real logo, as a vector so it stays sharp at every size and pixel density, gives the app a recognisable, on-brand identity.

The top nav bar also has no phone layout. It renders the brand, both section links and a 160px language selector in a single row at every width, so on phones it overflows and the logo can't be shown properly. DESIGN.md already says that below 744px the top nav collapses to the logo and a hamburger. The nav doesn't do that yet, so the logo work brings it into line.

## What Changes

- Convert the official Ricochet logo, supplied as a 1186×388 PNG in the issue, into a vector SVG. The SVG keeps the original shapes and the brand grey and red, but leaves out the ® mark.
- Vendor the SVG as a bundler-processed asset under `src/assets/`.
- In `TopNav`, replace the placeholder ring glyph **and** the "Ricochet" text with the logo. The logo stays a link to `/`, keeps an accessible name ("Ricochet"), and is sized to fit the nav bar height.
- Add a favicon based on the logo's mark (the red ring inside the grey "C" with its motion strokes) and reference it from `index.html`.
- Keep the logo's brand colours inside the SVG rather than mapping them to design tokens, and record this as an explicit exception to the design-system rule against custom hex values. Vendored brand artwork, like the flag SVGs, keeps its own colours. The token rule still governs UI styling.
- Below the 744px mobile breakpoint, collapse the top nav bar to the logo plus a hamburger button. The button opens a sheet holding the Players and Tournaments links and the language selector. From 744px up, the current single-row layout stays unchanged.
- Add minimal placeholder `/players` and `/tournaments` routes that show only a translated page heading. The nav already links to them, but they don't exist yet, and the nav's navigation and active-section behaviour needs real pages to land on. Real page content is out of scope.
- At phone width the logo fits beside the hamburger without clipping and without making the page scroll horizontally.
- Fix the section links' active-state styling. The active classes lost the CSS cascade to the base muted/transparent classes, so no section ever looked active (unnoticed until the placeholder routes existed). The menu must show the active section, and because both navs share one link component, the desktop nav gains a visible active state too.

## Capabilities

### New Capabilities

- `app-shell/branding`: how the app shows its brand identity: the vector Ricochet logo in the top nav bar (it replaces the text title, links home, and has an accessible name) and the favicon, at every viewport width.
- `app-shell/navigation`: how the top nav bar adapts to viewport width. It uses the single-row layout from 744px up and collapses to the logo plus a hamburger-triggered sheet with the section links and language selector below 744px.

### Modified Capabilities

_None._

## Impact

- `src/app/layout/TopNav.tsx`: replace the inline placeholder SVG and the "Ricochet" text with the logo, and add the responsive collapse with the hamburger button and sheet.
- `src/routes/players/index.tsx`, `src/routes/tournaments/index.tsx`: new placeholder routes (the generated `routeTree.gen.ts` changes with them).
- `src/ui/`: new Shadcn `sheet` primitive (and `button` if the registry pulls it in).
- `src/localization/locales/{en,cs,de,pl,nl,hu}.ts`: new keys for the hamburger button's accessible label (e.g. open/close menu).
- `src/assets/brand/ricochet-logo.svg`: new vendored logo SVG. No new runtime dependency.
- `public/favicon.svg` (new `public/` directory) and `index.html`: the logo-mark favicon and its `<link>`.
- `src/styles/globals.css`: a named `tablet` (744px) breakpoint token matching DESIGN.md.
- `docs/standards/design-system.md`: note that vendored brand and flag artwork may keep its own colours.
- `docs/adr/0008-vendored-brand-artwork-keeps-its-own-colours.md`: new ADR recording that exception.
- Tests: Playwright E2E checks for the logo and its accessible name at desktop and phone viewports, and for the hamburger sheet's navigation and language selection. Existing e2e tests that use the language selector at desktop width are unaffected. Existing e2e assertions on the page heading "Ricochet App" are unaffected.

## Out of Scope

- Changing the page `<title>`, the `app.title` translation keys, the footer legal text, or the home page heading "Ricochet App".
- Showing the logo anywhere other than the top nav bar (e.g. the footer or the home page hero).
- Dark-mode or monochrome logo variants. Dark mode isn't supported (see the design-system standard).
- Adding brand colours to `DESIGN.md` or the token set in `globals.css`.
- PWA manifest icons, Apple touch icons, and social preview images.
- Changing the desktop (≥744px) nav layout (other than the active-link styling fix above), the section links' destinations, or the language selector's own behaviour and contents.
- Any Players or Tournaments page content beyond a placeholder heading.
- A separate tablet-specific nav layout (744–1128px keeps the current single row).
- Responsive changes to page content or the footer outside the top nav bar.

## Traceability

- Issue: https://github.com/jirikrucek/ricochet-app/issues/36
