import { spawn } from 'node:child_process';

import { localSupabaseEnv } from './localSupabaseEnv.ts';

// Runs the command given as arguments with the local Supabase connection in
// its environment: Playwright's web server is the Vite dev server, which must
// reach only the local Supabase (docs/standards/testing.md). Resolving it here
// instead of in playwright.config.ts keeps loading that config (--list, every
// worker) from needing Supabase.
const [command, ...args] = process.argv.slice(2);

const child = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env, ...localSupabaseEnv() },
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code) => process.exit(code ?? 1));
