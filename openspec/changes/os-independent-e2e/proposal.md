## Why

The E2E suite is meant to run on a macOS host, in the Ubuntu dev container, and in GitHub Actions, but it only works reliably on Linux. The two screenshot tests compare against `-chromium-linux.png` baselines, which fail or get regenerated on macOS and can drift with font rendering. The web server, port and browser folder are also set up differently in each environment.

## What Changes

- Remove the two pixel-snapshot tests ("Logo on a high-density display", "Logo when the page is zoomed in") and their `-linux.png` baselines. Replace them with structural checks: vector source, rendered size scaling with zoom, `devicePixelRatio`, and ratio versus viewBox.
- Reword the two scenarios of the requirement "Logo stays sharp at any display density or zoom level" to statements that can be verified without comparing pixels.
- Add an ESLint rule that bans `toHaveScreenshot` and `toMatchSnapshot` in `tests/e2e`, and an ADR recording why.
- `playwright.config.ts`: always start a fresh `vite dev` server (`reuseExistingServer: false`, `--strictPort`), with the port read from `E2E_PORT` (default `4173`).
- Dev container: keep `.playwright-browsers` in a named volume, like `node_modules`.
- Add a `test:e2e:setup` npm script and recipes (`docs/agents/e2e-tests.md`) for macOS, the dev container and CI.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell/branding`: the scenarios "Logo on a high-density display" and "Logo when the page is zoomed in" are reworded. The requirement itself (vector artwork that stays sharp) does not change.

## Impact

- `openspec/specs/app-shell/branding/spec.md` (via the delta spec, applied on archive)
- `tests/e2e/app-shell/branding.spec.ts`, `tests/e2e/app-shell/shell.ts`, and the removed `branding.spec.ts-snapshots/`
- `playwright.config.ts`, `eslint.config.mjs`, `package.json`, `.devcontainer/devcontainer.json`, `docs/agents/e2e-tests.md`, `AGENTS.md`
- New ADR in `docs/adr/`
- No production code, dependencies, or APIs change.

## Out of Scope

- Locale, timezone, reduced-motion and retry settings.
- Running E2E against a production build (`vite build` plus `vite preview`); the suite stays on `vite dev`.
- A macOS job in CI; CI stays Ubuntu-only.
- Changing the logo asset or any other branding requirement.
- Editing archived changes.

## Traceability

- Issue: #51
