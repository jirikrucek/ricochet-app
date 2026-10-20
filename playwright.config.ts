import os from 'node:os';
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

// E2E tests reach only the local Supabase (docs/standards/testing.md). The
// global setup and the web server wrapper find it, so loading this config
// never needs it.
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/support/playwrightLocalSupabase.ts',
  fullyParallel: true,
  // Playwright's default (half the cores) starts 7 browsers on a 14-core dev
  // container, which overloads the single dev server and times out page
  // loads. Cap it at 4; smaller machines such as the CI runner keep the default.
  workers: Math.min(4, Math.max(1, Math.floor(os.availableParallelism() / 2))),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    channel: undefined,
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `node tests/support/runWithLocalSupabaseEnv.ts npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    // Always start our own server: attaching to whatever already listens on
    // the port makes runs depend on the machine's state.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Points Sentry at the dev server itself, so tests can intercept the
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
