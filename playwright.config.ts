import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const configDir = path.dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(
  configDir,
  '.playwright-browsers',
);

const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

// E2E tests reach only the local Supabase (docs/standards/testing-standard.md). The
// global setup and the web server wrapper find it, so loading this config
// never needs it.
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/support/playwrightLocalSupabase.ts',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    channel: undefined,
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    // A production build served by `vite preview`, not the dev server: every
    // test opens a fresh browser context, and the dev server transforms and
    // serves hundreds of unbundled modules per page load. Under parallel
    // workers that timed out page loads; the build loads in a few requests.
    command: `node tests/support/runWithLocalSupabaseEnv.ts npm run test:e2e:serve -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    // Always start our own server: attaching to whatever already listens on
    // the port makes runs depend on the machine's state.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Points Sentry at the web server itself, so tests can intercept the
      // envelopes it sends and assert that a failure was reported. Nothing
      // leaves the machine.
      VITE_SENTRY_DSN: `http://e2e@127.0.0.1:${port}/1`,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
