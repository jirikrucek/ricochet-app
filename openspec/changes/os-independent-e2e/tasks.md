## 1. Pixel-free "sharp" checks

- [x] 1.1 Rewrite the E2E tests for the scenarios "Logo on a high-density display" and "Logo when the page is zoomed in" to assert the reworded scenarios (SVG source, box unchanged at 2x with `devicePixelRatio` 2, box doubled at 200% zoom with the viewBox ratio kept), and confirm they fail or pass for the right reasons
- [x] 1.2 Delete `tests/e2e/app-shell/branding.spec.ts-snapshots/` and every remaining `toHaveScreenshot` call
- [x] 1.3 Run `npm run test:e2e` and confirm no baselines are written or required

## 2. Guard against snapshots

- [x] 2.1 Add a failing lint check: a temporary `toHaveScreenshot` call in `tests/e2e` that the new rule must flag
- [x] 2.2 Add the `no-restricted-syntax` rule for `toHaveScreenshot` and `toMatchSnapshot` scoped to `tests/e2e/**` in `eslint.config.mjs`, then remove the temporary call
- [x] 2.3 Write the ADR in `docs/adr/` (next number after 0008) and reference it in the rule message

## 3. Predictable server

- [x] 3.1 In `playwright.config.ts`, read `E2E_PORT` (default `4173`) and derive `baseURL`, `webServer.url` and the `--port` flag from it
- [x] 3.2 Set `reuseExistingServer: false` and add `--strictPort` to the server command
- [x] 3.3 Verify: with the port occupied, the run fails fast with a clear error; with `E2E_PORT` set to a free port, the suite passes

## 4. Browsers and setup

- [ ] 4.1 Add the `test:e2e:setup` script in `package.json` and have `test:e2e:install` callers (dev container, CI workflow) use it
- [ ] 4.2 Add the named volume for `.playwright-browsers` to `.devcontainer/devcontainer.json` and the matching `chown` to `postCreateCommand`
- [ ] 4.3 Add README recipes for macOS, the dev container and CI, including `E2E_PORT`

## 5. Verification

- [ ] 5.1 Run the full suite on the macOS host
- [ ] 5.2 Rebuild the dev container and run the full suite there
- [ ] 5.3 Push and confirm the Verification checks workflow passes on Ubuntu
- [ ] 5.4 Run the Definition of Done from `AGENTS.md`
