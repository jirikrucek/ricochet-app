Each slice is a complete, demoable path. Work it test-first: write the listed E2E tests, run `npm run test:e2e` and confirm they fail for the expected reason (red), implement (green), then run that slice's verification. E2E specs live in `tests/e2e/app-shell/`. Each test sets its scenario's viewport with `page.setViewportSize`. Desktop means 1280×800 and phone means 375×812, unless a scenario names another width.

## 1. Prefactoring: placeholder Players and Tournaments routes (design D8)

- [x] 1.1 Write `tests/e2e/app-shell/routes.spec.ts`: at desktop, visiting `/players` shows an `h1` "Players" and visiting `/tournaments` shows an `h1` "Tournaments". Run it and confirm it fails.
- [x] 1.2 Add `src/routes/players/index.tsx` and `src/routes/tournaments/index.tsx`. Each renders an `h1` with `t('nav.players')` / `t('nav.tournaments')`, using the same heading classes as `src/routes/index.tsx`. Let the router plugin regenerate `routeTree.gen.ts`.
- [x] 1.3 Verify: 1.1 passes, the existing `tests/e2e/localization/language-selection.spec.ts` still passes, and `npm run typecheck` and `npm run lint` are clean.

## 2. Slice: the vector logo replaces the text title in the nav (branding)

- [x] 2.1 Write the failing E2E tests in `tests/e2e/app-shell/branding.spec.ts`, one per scenario:
  - "Logo shown on the home page" (desktop): `getByRole('link', { name: 'Ricochet' })` is visible in the `banner`. It contains a loaded `img` (`complete && naturalWidth > 0`). The banner has no visible text "Ricochet" and no other `svg`/`img` next to the logo.
  - "Logo shown on a phone" (375px): the same link and loaded logo are visible in the banner.
  - "Logo shown on every section of the app": on `/players`, then after navigating to `/tournaments`, the logo link is visible and its `img` `src` is unchanged.
  - "Returning home from another section": on `/tournaments`, clicking the logo link lands on `/` with the home heading visible.
  - "Screen reader announces the brand name": with English active, the link's accessible name is exactly "Ricochet" and its `img` has `alt=""` and `aria-hidden="true"`.
  - "Brand name is not translated": after switching to Čeština, the link's accessible name is still exactly "Ricochet".
  - "Logo matches the official artwork": the logo's `src` is an SVG (`.svg` URL or `data:image/svg+xml`). Its rendered width/height ratio equals the SVG `viewBox` ratio (±1%). An element screenshot matches a committed `toHaveScreenshot` baseline that shows grey lettering, the red ring and no ®.
  - "Logo on a high-density display": in a browser context with `deviceScaleFactor: 2`, the `src` is an SVG and an element screenshot matches its own baseline. That baseline is captured at 2× and reviewed for crisp edges.
  - "Logo when the page is zoomed in": with the page zoomed to 200% (`document.documentElement.style.zoom = '2'`), the `src` is an SVG and an element screenshot matches its own reviewed baseline.
- [x] 2.2 Vectorise the logo (design D1). Work from the downloaded PNG in the session scratchpad. Erase the ® and split the image into its grey and red layers. Trace them with a throwaway `potrace` script (do not add it to `package.json`). Rebuild the red ring as exact circles. Sample the exact brand hex colours. Remove the white background, crop the `viewBox` tightly to the wordmark, and minify with ad hoc `svgo`.
- [x] 2.3 Check the vector against the source. Render the SVG in Chromium at source scale and diff it against the ®-erased, cropped PNG. Review the overlay visually and iterate until there's no visible deviation.
- [x] 2.4 Commit the result as `src/assets/brand/ricochet-logo.svg`.
- [x] 2.5 Record the colour exception (design D3):
  - Add `docs/adr/0008-vendored-brand-artwork-keeps-its-own-colours.md`, citing ADR 0006's flags as precedent.
  - Add a "Vendored artwork" note to `docs/standards/design-system.md`.
- [x] 2.6 Update `src/app/layout/TopNav.tsx` (design D2, D4):
  - Remove the placeholder `<svg>` and the "Ricochet" text.
  - Render `<img src={logo} alt="" aria-hidden="true" className="h-xl w-auto shrink-0">` inside the home `Link`.
  - Give the `Link` `aria-label="Ricochet"` (a non-translated constant) and `min-w-0`.
  - Drop the now-unused `type-display-sm` and `gap-sm` classes from the link.
- [x] 2.7 Generate the screenshot baselines with `--update-snapshots`, review every image against the source artwork, and commit them.
- [x] 2.8 Verify: all branding tests from 2.1 pass. The "Logo shown on a phone" test passes before the collapse slice because the logo is already in the row. The existing language-selection E2E tests still pass.

## 3. Slice: Ricochet favicon (branding)

- [x] 3.1 Write the failing E2E test in `branding.spec.ts`, "Favicon shown in the browser tab": the page has `link[rel="icon"]` with `type="image/svg+xml"`, and requesting its `href` returns `200` with content type `image/svg+xml`.
- [x] 3.2 Create `public/favicon.svg` (design D5) from the same ring geometry as the logo: only the red ring, in brand red, centred in a square `viewBox` with padding, on a transparent background. Check it visually at 16px and 32px.
- [x] 3.3 Add `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` to `index.html`.
- [x] 3.4 Verify: 3.1 passes, and `npm run build` copies `favicon.svg` into `dist/`.

## 4. Slice: responsive collapse to the logo and menu button below 744px (navigation, branding fit)

- [x] 4.1 Write the failing E2E tests in `tests/e2e/app-shell/navigation.spec.ts`:
  - "Tablet width shows the full nav" (744px): the logo, the Players and Tournaments links and the language combobox are visible in the banner, and the menu button is not visible.
  - "Phone width shows the collapsed nav" (375px): the logo and the menu button are visible. The Players and Tournaments links and the language combobox are not visible in the banner. `document.documentElement.scrollWidth <= window.innerWidth`.
  - "Nav collapses just below the breakpoint" (743px): the logo and the menu button are visible, and the section links are not.
  - "Nav adapts when the viewport is resized": load at 1280px with the full nav visible, resize to 375px, and assert the collapsed nav without reloading.
- [x] 4.2 Write the failing branding fit tests in `branding.spec.ts`:
  - "Logo sits inside the nav bar at desktop width" (1280px): the logo's bounding box is fully inside the banner's bounding box. The Players link's centre is within ±2px of the banner's horizontal centre, and the language combobox is right-aligned within the shell.
  - "Logo fits beside the menu button on a phone" (375px): the logo's box is inside the banner and doesn't intersect the menu button's box, and there is no horizontal overflow.
  - "Logo fits on the narrowest supported phone" (320px): the logo's box is inside the banner, its rendered ratio equals the `viewBox` ratio (±1%), and there is no horizontal overflow.
- [x] 4.3 Add `--breakpoint-tablet: 744px;` to the `@theme` block in `src/styles/globals.css` (design D6).
- [x] 4.4 Add `nav.openMenu` to all six locale files (`src/localization/locales/{en,cs,de,pl,nl,hu}.ts`). The values are "Open menu", "Otevřít menu", "Menü öffnen", "Otwórz menu", "Menu openen" and "Menü megnyitása".
- [x] 4.5 Restructure `TopNav` (design D6):
  - The single logo `Link` stays at the start of the row.
  - The section links and the language selector are wrapped so they show only from `tablet` up (`hidden tablet:…`), keeping the current centred-links grid at ≥744px.
  - A 48×48px (`size-xxl`) menu `button` with a lucide `MenuIcon` and `aria-label={t('nav.openMenu')}` sits at the end of the row and shows only below `tablet` (`tablet:hidden`). It doesn't open anything yet.
- [x] 4.6 Verify: all tests from 4.1 and 4.2 pass, every branding test from slice 2 still passes, and the existing desktop language-selection E2E tests still pass.

## 5. Slice: menu sheet with links, language selector and accessible dismissal (navigation)

- [x] 5.1 Write the failing E2E tests in `navigation.spec.ts` (phone, unless noted):
  - "Opening the menu": click the menu button. A `dialog` becomes visible, containing the Players and Tournaments links and a language combobox.
  - "Active section is indicated in the menu": on `/players`, open the menu. The dialog's Players link has `aria-current="page"` and the Tournaments link doesn't.
  - "Going to Tournaments from the menu": open the menu on `/` and click Tournaments. The URL is `/tournaments`, the "Tournaments" heading is visible and the dialog is hidden.
  - "Switching to German on a phone": open the menu and choose "Deutsch" in the dialog's language combobox. The home page text "Die Initialisierung des Workspaces ist bereit." is visible.
  - "Closing the menu with Escape": on `/players`, open the menu and press Escape. The dialog is hidden, the URL is still `/players`, and the menu button is focused.
  - "Closing the menu by tapping outside it": open the menu and click the backdrop outside the dialog. The dialog is hidden.
  - "Screen reader announces the menu button in English": the button's accessible name is "Open menu" and it has `aria-expanded="false"`. After opening the menu, `aria-expanded` is `"true"`.
  - "Menu button name follows the active language": switch to Čeština (via the menu's selector), close the menu, and assert the button's accessible name is "Otevřít menu".
  - "Keyboard focus stays in the open menu": open the menu with the keyboard (focus the button and press Enter), Tab through every focusable item, and assert focus never leaves the dialog after one more Tab.
- [x] 5.2 Add the Shadcn sheet primitive with `npx shadcn@latest add sheet`, plus `button` if the registry pulls it in. Confirm both files land in `src/ui/` and are built on `@base-ui/react`, and that `npm run lint` boundaries pass.
- [x] 5.3 Add the `nav.closeMenu` and `nav.menuTitle` keys to all six locale files:
  - `closeMenu`: "Close menu", "Zavřít menu", "Menü schließen", "Zamknij menu", "Menu sluiten", "Menü bezárása".
  - `menuTitle`: "Menu", "Menu", "Menü", "Menu", "Menu", "Menü".
- [x] 5.4 Wire the sheet into `TopNav` (design D7):
  - `const [open, setOpen] = useState(false)` controls the `Sheet`, and the slice-4 menu button becomes its trigger.
  - The sheet opens from the right, is at most 320px wide, and is titled `t('nav.menuTitle')`. Its close control is labelled `t('nav.closeMenu')`.
  - It contains the stacked `NavLink`s, each calling `setOpen(false)` on click, and `<LanguageSelect id="language-menu-trigger" labelClassName=…visible… />`.
  - If the trigger doesn't expose `aria-expanded`, set it explicitly from `open`.
- [x] 5.5 Close the sheet when the viewport crosses into `tablet`. Use a `matchMedia('(min-width: 744px)')` change listener inside a `useEffect` with cleanup.
- [x] 5.6 Add an E2E regression test for 5.5 in `navigation.spec.ts`: open the menu at 375px, resize to 1280px, and assert that no dialog or backdrop is visible and the page scrolls normally.
- [x] 5.7 Verify: every navigation test passes, and all branding, routes and existing language-selection E2E tests still pass.

## 6. Definition of Done

- [x] 6.1 Check the changed code against `docs/standards/` (design-system tokens and the vendored-artwork note, project-structure placement and boundaries) and `docs/adr/` (0003, 0005, 0006, 0007 and the new 0008), and fix any deviations.
- [x] 6.2 Run `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test:all`. All must be clean or pass at 100%.
- [x] 6.3 Audit the new and changed test files (anti-ghost):
  - every test has meaningful assertions;
  - there is no `.skip`;
  - nothing under test is mocked;
  - every one of the 26 spec scenarios (13 branding + 13 navigation) in `specs/app-shell/{branding,navigation}/spec.md` maps to a named E2E test.
- [x] 6.4 Run `npx openspec validate add-ricochet-logo-to-nav --strict` and report the Definition of Done status.
