# ADR 0009: E2E Tests Do Not Use Pixel Snapshots

- Status: Accepted
- Created: 2026-10-05

## Context

The E2E suite has to pass unchanged on a macOS host, in the Ubuntu dev container and in GitHub Actions (issue #51). Playwright stores screenshot baselines per platform (`-chromium-linux.png`), and text rendering and anti-aliasing differ between macOS and Linux. The only baselines in the suite were the two logo tests, and they existed for Linux only, so they failed or rewrote baselines on macOS.

## Decision

E2E tests do not compare pixels. `toHaveScreenshot` and `toMatchSnapshot` are banned in `tests/e2e` by an ESLint `no-restricted-syntax` rule in `eslint.config.mjs`. Tests assert structure instead: roles, attributes, element sizes and positions, and the source of vector artwork.

For the requirement "Logo stays sharp at any display density or zoom level" that means checking the logo is served as an SVG, keeps its size at 2x density and doubles at 200% zoom.

## Alternatives Considered

- One baseline set per OS (`{platform}` in the snapshot path). Rejected: two or more image sets to keep in step, and Linux runners can still drift from each other.
- Run every E2E test in one pinned Linux Docker image. Rejected: it rules out running natively on macOS, which is one of the three required environments.
- Keep screenshots with a pixel tolerance. Rejected: still flaky across font rendering, and a loose tolerance hides real regressions.

## Consequences

- A change that only makes the logo look wrong (colours, shape) is not caught by E2E. The artwork is vendored and rarely changes (ADR 0008).
- Revisiting this means replacing the lint rule together with a plan for how baselines are produced in every environment.
