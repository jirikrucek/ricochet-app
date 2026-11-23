# Testing Guide

The Playwright suite in `tests/e2e` runs the same way on a macOS host, in the dev container and in GitHub Actions. It builds the app into `dist-e2e/` and serves it with `vite preview` on `127.0.0.1:4173`. Set `E2E_PORT` to use another port. The run fails fast if the port is already taken. It uses a production build, not `vite dev`, because every test loads the page in a fresh browser context: the dev server serves hundreds of unbundled modules per load, and parallel workers timed those loads out.

Which data each test level may use is set by `docs/standards/testing-standard.md` (see [ADR 0011](../adr/ADR0011-tests-reach-only-a-local-supabase-with-seed-data.md)).

## Driving Playwright outside the suite

For a screenshot or a quick look at a page outside the test suite, reuse the Chromium that `npm run test:e2e:setup` installed in `.playwright-browsers`. The `test:e2e*` scripts point Playwright at it; any other script or `npx playwright` command must do so itself, or it downloads another Chromium into `~/.cache`:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.playwright-browsers" npx playwright screenshot http://127.0.0.1:4173/players players.png
```

## A test fails with "The page logged or reported errors"

Every E2E test fails on a console error, an uncaught error, or a report to Sentry (see `docs/standards/testing-standard.md`). The failure lists each error, with the URL of the request or script behind it, and each report as a `Sentry event:` or `Sentry log (error):` line. Read it as one of four cases:

- **A Content Security Policy violation** ("violates the following Content Security Policy directive"): the app reaches an origin `vercel.json` doesn't allow. Production would block it too, so add the origin to `connect-src` (see `docs/guides/deployment-guide.md`), or drop the request.
- **A failure the test causes on purpose**, such as an intercepted 500: allow the browser's log of it with `allowConsoleErrors(/status of 500 .*\/rest\/v1\/rpc\/players_sorted/)`, naming the status and the path. A failed query is reported to Sentry too, with its key after the message (`{"queryKey":["players_sorted",…]}`), so also allow it with `allowSentryReports(/"queryKey":\["players_sorted"/)`.
- **"No Sentry client on … to flush"**: at teardown the fixture sends what Sentry still buffers, through the client the SDK keeps on `window.__SENTRY__`. If the app started fine, a `@sentry/react` upgrade moved that client; update `SentryCarrier` in `tests/e2e/fixtures.ts`, and the flush-time log case in `tests/e2e/internals/fixtures.spec.ts`, to the SDK's new layout.
- **Anything else**: a real error in the app. Fix the app, not the test.

## `npm run spec:coverage` fails

The check (`checks/checkScenarioCoverage.ts`, also run by `npm run spec:validate`) reads the specs with the OpenSpec CLI and the tests with `playwright test --list`, and fails in one of these ways:

- **A scenario has no E2E test, or an E2E test covers no scenario**: follow the **Spec scenarios** rules in `docs/standards/testing-standard.md`. The failure lists each scenario as `spec › requirement › scenario` and each test as `file › describe › title`.
- **Every test in `tests/e2e/internals/` is listed as covering no scenario**: the check reads each test's file from the title Playwright gives the file's suite in its JSON report, a path relative to `tests/e2e`. If a Playwright upgrade changed that title, update `isInternalsTest` in `checks/scenarioCoverage.ts`. The check fails closed, so no test goes unchecked meanwhile.
- **"openspec status lists no proposal artifact"**: the OpenSpec CLI or the change schema no longer names the proposal `proposal`. Update `isProposalDone` in `checks/scenarioCoverage.ts` to the new schema.

## Base UI and React Hook Form in tests

The UI primitives come from Base UI ([ADR 0015](../adr/ADR0015-shadcn-components-use-base-ui-primitives.md)) and the forms from React Hook Form. Each behaves in a way that makes a straightforward test fail, or pass for the wrong reason:

- **Focus moves after each Tab, not at once.** A dialog's focus guard needs a moment to wrap focus, and back-to-back `page.keyboard.press('Tab')` calls outrun it. Wait for focus to move before the next press, as the focus tests in `tests/e2e/players/filters-sheet.spec.ts` and `tests/e2e/app/navigation.spec.ts` do.
- **An open modal hides the page from the accessibility tree.** While a modal sheet or menu is open, `getByRole('table')` or `getByRole('button', …)` finds nothing behind it. Find those elements with a CSS locator instead, as `tests/e2e/players/filters-panel.spec.ts` does with `page.locator('table')`.
- **A Select option needs a hover before its click in jsdom.** Base UI ignores a click on an option that was never hovered, so send `fireEvent.mouseMove(option)` before `fireEvent.click(option)`, as the `choose` helper in `src/modules/players/ui/list-filters/ListFilters.unit.test.tsx` does.
- **A form submits asynchronously.** React Hook Form's `handleSubmit` validates before it calls the handler, so after clicking submit, `await waitFor(…)` for the handler's effect instead of asserting straight away.

## Local Supabase

Integration and E2E tests run against a local Supabase loaded with the migrations and the fictional **seed data** in `supabase/seed.sql`. Unit tests don't need it. In every environment:

- Docker must be running.
- `npm run test:integration`, `npm run test:e2e` and `npm run test:all` start Supabase when it isn't running: `tests/support/startLocalSupabase.ts` runs `npx supabase start` before the test runner, and does nothing when Supabase already runs. The first start downloads the images and can take several minutes. Supabase keeps running until `npx supabase stop`.
- If Docker isn't running, those scripts fail fast with "Could not start the local Supabase". Running `vitest` or `playwright test` directly starts nothing: they fail fast with "Local Supabase is not running" until you run `npx supabase start`.

How the tests get the connection: `tests/support/localSupabaseEnv.ts` runs `supabase status -o json` and takes its `API_URL` and `PUBLISHABLE_KEY` (and `DB_URL`, for the RLS integration test, which passes it to `supabase db query --remote=<url> --read-only`). It refuses any host other than `127.0.0.1` or `localhost`. These are resolved when a run starts, not when a config loads, so unit tests and `playwright test --list` need no Supabase. A Vitest global setup (`tests/support/vitestLocalSupabase.ts`) puts the values in the process environment for the integration project. Playwright does the same with a global setup for the specs, and `tests/support/runWithLocalSupabaseEnv.ts` builds and serves the app with them. Process variables take precedence over `.env*` files, so your `.env.local` doesn't affect test runs, even if it points at the shared project. The rule for connection settings is in `docs/standards/testing-standard.md`.

To restore the seed data, for example after editing `supabase/seed.sql` or a migration, run `npx supabase db reset`. It re-applies all migrations and the seed. After a migration change, also run `npm run supabase:types` to regenerate `src/db/supabase.types.ts`.

## macOS

```sh
npm ci
npm run test:e2e:setup   # downloads Chromium into .playwright-browsers
# needs Docker Desktop (or another Docker engine) running; starts Supabase if needed
npm run test:e2e
```

If `.playwright-browsers` was filled by an older dev container (Linux build), delete it first. Playwright treats it as already installed and skips the macOS download.

## Dev container (Ubuntu)

Open the repo with **Dev Containers: Clone Repository in Container Volume**, so the checkout (with `node_modules` and `.playwright-browsers`) lives in a Docker volume and the host and the container never share binaries. Don't use **Reopen in Container** on a host checkout. The container setup runs in two steps: `updateContentCommand` runs `npm ci` (VS Code waits for it before starting the extensions), and `postCreateCommand` installs the system libraries Chromium needs and runs `npm run test:e2e:setup` (VS Code does not wait for it, so Playwright tests can fail with a missing-browser error until it finishes). If `npm ci` fails, the container opens in recovery mode: read the creation log, fix the cause, and rebuild. `/home/vscode` is a named volume, so the Claude Code and GitHub CLI logins survive a rebuild. The container runs its own Docker engine (the `docker-in-docker` feature), so after a rebuild it has no Supabase containers; `npm run test:e2e` (or `test:integration`, `test:all`) starts them on its first run.

## GitHub Actions

The Verification checks workflow (`.github/workflows/verification-checks.yml`) runs two jobs in parallel: static checks plus unit tests, and integration plus E2E tests. The second job installs the Supabase CLI with `supabase/setup-cli` (at the version in `package-lock.json`), starts Supabase in the background while `npm ci` and the Playwright browser install run, and excludes the services the tests don't need to cut start-up time. The tests read the URL and key through the same helper, so the workflow needs no secrets. It then runs `npm run test:integration` and `npm run test:e2e` on `ubuntu-latest`, where Playwright uses 4 workers (one per vCPU, set in `playwright.config.ts`) instead of the 7 used locally. A report is uploaded as an artifact when a run fails.
