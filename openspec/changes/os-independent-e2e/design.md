## Context

See proposal.md - Why. The suite runs `tests/e2e` with Playwright against `vite dev`. Only the two `toHaveScreenshot` tests in `branding.spec.ts` depend on the OS: their baselines are named `-chromium-linux.png`. Everything else asserts roles, attributes and bounding boxes. `playwright.config.ts` pins `PLAYWRIGHT_BROWSERS_PATH` to `.playwright-browsers` in the repo, which the dev container shares with the macOS host through its bind mount. `node_modules` already avoids the same problem with a named volume.

## Goals / Non-Goals

**Goals**
- The same `npm run test:e2e` passes on macOS, in the dev container and on `ubuntu-latest` without per-OS files or settings.
- A pixel snapshot cannot be added again unnoticed.

**Non-Goals**
- Verifying that the logo looks right. That visual check is given up on purpose.
- Changing how CI is run, or adding a macOS CI job.

## Decisions

**Replace pixel snapshots with structural checks.** The "sharp" requirement is verified by proxy:
- the logo `src` is an SVG (existing `expectSvgSource`),
- at `deviceScaleFactor: 2` the rendered box equals the 1x box and `devicePixelRatio` is 2,
- at `zoom: 2` the rendered box is twice the 1x box and still matches the SVG viewBox ratio (existing `expectRenderedRatioToMatchViewBox`).

Alternatives: a per-OS baseline set (more files to maintain, and Linux runners still drift); a single pinned Docker image for all runs (rules out running natively on macOS); tolerant screenshots (still flaky across fonts); a canvas pixel comparison (brittle, and renderer-specific).

**Ban snapshots with ESLint, and record the decision in an ADR.** A `no-restricted-syntax` rule scoped to `tests/e2e/**` flags `toHaveScreenshot` and `toMatchSnapshot` calls and points to the ADR. A rule fails on the developer's machine, while a convention in a doc is only read afterwards. The ADR holds the trade-off so a future change can revisit it deliberately.

**One server mode, no reuse.** `reuseExistingServer: false` and `vite --strictPort`, with the port read once from `E2E_PORT` (default `4173`) and used for `baseURL`, `webServer.url` and `--port`. `--strictPort` makes a busy port a clear failure instead of Vite moving to the next port while Playwright waits on the old one. `vite dev` stays: a production build is out of scope.

**Named volume for `.playwright-browsers`.** Same mechanism as `node_modules` in `devcontainer.json`, plus a `chown` in `postCreateCommand`. The container keeps its Linux browsers and the host keeps its own. The repo-local `PLAYWRIGHT_BROWSERS_PATH` override stays unchanged. Alternative: dropping the override and using Playwright's default per-user cache; not chosen because the repo-local folder is deliberate and the volume solves the sharing problem.

**`test:e2e:setup` for the portable part.** It runs the browser install. `playwright install-deps` is Linux-only and needs `sudo`, so it stays in the dev container and the CI workflow. `docs/agents/e2e-tests.md` documents the three recipes and is linked from the AGENTS.md playbooks.

## Risks / Trade-offs

- [Visual regressions in the logo go unnoticed] → The remaining checks cover size, proportions, vector source and fit in the nav bar; the logo asset is vendored (ADR 0008) and rarely changes.
- [The existing host folder `.playwright-browsers` may hold Linux browsers from earlier container runs] → The volume hides it inside the container; on the host, `npm run test:e2e:setup` downloads the macOS build.
- [A fresh server per run costs a few seconds locally] → Accepted: reproducibility matters more.
- [The macOS and container runs are only verified manually, not in CI] → Both are run once as part of this change; CI keeps guarding Linux.

## Migration Plan

Merge as one PR. Existing dev containers need a rebuild to pick up the new volume. Rollback is a plain revert.
