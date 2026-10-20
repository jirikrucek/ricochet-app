# End-to-end tests

The Playwright suite in `tests/e2e` runs the same way on a macOS host, in the dev container and in GitHub Actions. It builds the app into `dist-e2e/` and serves it with `vite preview` on `127.0.0.1:4173`. Set `E2E_PORT` to use another port. The run fails fast if the port is already taken. It uses a production build, not `vite dev`, because every test loads the page in a fresh browser context: the dev server serves hundreds of unbundled modules per load, and parallel workers timed those loads out.

Which data each test level may use is set by `docs/standards/testing.md` (see [ADR 0011](../adr/ADR0011-tests-reach-only-a-local-supabase-with-seed-data.md)).

## Local Supabase

Integration and E2E tests run against a local Supabase loaded with the migrations and the fictional **seed data** in `supabase/seed.sql`. Unit tests don't need it. In every environment:

- Docker must be running.
- Start Supabase once before the tests: `npx supabase start`. It keeps running until `npx supabase stop`.
- `npm run test:integration`, `npm run test:e2e` and `npm run test:all` fail fast with "Local Supabase is not running" when it isn't started.

How the tests get the connection: `tests/support/localSupabaseEnv.ts` runs `supabase status -o json` and takes its `API_URL` and `PUBLISHABLE_KEY`. It refuses any host other than `127.0.0.1` or `localhost`. Both are resolved when a run starts, not when a config loads, so unit tests and `playwright test --list` need no Supabase. A Vitest global setup (`tests/support/vitestLocalSupabase.ts`) puts the values in the process environment for the integration project. Playwright does the same with a global setup for the specs, and `tests/support/runWithLocalSupabaseEnv.ts` builds and serves the app with them. Process variables take precedence over `.env*` files, so your `.env.local` doesn't affect test runs, even if it points at the shared project. Don't put test connection settings in any file.

To restore the seed data, for example after editing `supabase/seed.sql` or a migration, run `npx supabase db reset`. It re-applies all migrations and the seed. After a migration change, also run `npm run supabase:types` to regenerate `src/repositories/database.types.ts`.

## macOS

```sh
npm ci
npm run test:e2e:setup   # downloads Chromium into .playwright-browsers
npx supabase start       # needs Docker Desktop (or another Docker engine) running
npm run test:e2e
```

If `.playwright-browsers` was filled by an older dev container (Linux build), delete it first. Playwright treats it as already installed and skips the macOS download.

## Dev container (Ubuntu)

Rebuild the container once. `postCreateCommand` installs the system libraries Chromium needs and runs `npm run test:e2e:setup`. `node_modules` and `.playwright-browsers` live in named volumes, so the host and the container never share binaries. The container runs its own Docker engine (the `docker-in-docker` feature), so start Supabase inside it with `npx supabase start`, then run `npm run test:e2e`.

## GitHub Actions

The Verification checks workflow starts Supabase itself, before the integration tests: `npx supabase start -x studio,imgproxy,storage-api,edge-runtime,logflare,vector,mailpit,realtime`. The excluded services aren't needed by the tests. The tests then read the URL and key through the same helper, so the workflow needs no secrets. It then runs `npm run test:e2e:setup`, `npx playwright install-deps chromium` and `npm run test:e2e` on `ubuntu-latest`. A report is uploaded as an artifact when a run fails.
