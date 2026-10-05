# Ricochet App

The app is used to keep track of players and organize tournaments in a racket sport called ricochet.

## End-to-end tests

The Playwright suite in `tests/e2e` runs the same way on a macOS host, in the dev container and in GitHub Actions. It starts its own `vite dev` server on `127.0.0.1:4173`. Set `E2E_PORT` to use another port. The run fails fast if the port is already taken.

Tests assert structure (roles, attributes, sizes), not pixels, because screenshots differ per OS. ESLint rejects `toHaveScreenshot` and `toMatchSnapshot` in `tests/e2e` (see [ADR 0009](docs/adr/0009-e2e-tests-do-not-use-pixel-snapshots.md)).

### macOS

```sh
npm ci
npm run test:e2e:setup   # downloads Chromium into .playwright-browsers
npm run test:e2e
```

If `.playwright-browsers` was filled by an older dev container (Linux build), delete it first. Playwright treats it as already installed and skips the macOS download.

### Dev container (Ubuntu)

Rebuild the container once. `postCreateCommand` installs the system libraries Chromium needs and runs `npm run test:e2e:setup`. `node_modules` and `.playwright-browsers` live in named volumes, so the host and the container never share binaries. Then run `npm run test:e2e`.

### GitHub Actions

The Verification checks workflow runs `npm ci`, `npm run test:e2e:setup`, `npx playwright install-deps chromium` and `npm run test:e2e` on `ubuntu-latest`. A report is uploaded as an artifact when a run fails.
