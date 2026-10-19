import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

import { localSupabaseEnv } from './tests/support/localSupabaseEnv';

const configDir = path.dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(
  configDir,
  '.playwright-browsers',
);

const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

// E2E tests reach only the local Supabase (docs/standards/testing.md). Process
// env wins over .env* files in Vite, so a .env.local pointing elsewhere can't
// leak into the dev server. Test workers inherit these too, for the specs that
// call the local API directly.
const supabaseEnv = localSupabaseEnv();
Object.assign(process.env, supabaseEnv);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    channel: undefined,
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    // Always start our own server: attaching to whatever already listens on
    // the port makes runs depend on the machine's state.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { ...supabaseEnv },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
