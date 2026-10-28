import { execFileSync } from 'node:child_process';

// The only way a test reaches a database (docs/standards/testing-standard.md, ADR 0011).
// Reads the running local Supabase from the CLI instead of from .env* files,
// so a developer's .env.local pointing at the shared project can't leak in.

export type LocalSupabaseEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
};

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

const NOT_RUNNING_MESSAGE =
  'Local Supabase is not running. Integration and E2E tests need it: start Docker, then run `npx supabase start` (see docs/guides/e2e-tests-guide.md).';

function readStatus(): Record<string, unknown> {
  let output: string;
  try {
    output = execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
      encoding: 'utf8',
      // The CLI prints notices (stopped services, updates) on stderr.
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    throw new Error(NOT_RUNNING_MESSAGE, { cause: error });
  }

  try {
    return JSON.parse(output) as Record<string, unknown>;
  } catch (error) {
    throw new Error(NOT_RUNNING_MESSAGE, { cause: error });
  }
}

function requireField(status: Record<string, unknown>, field: string) {
  const value = status[field];
  if (typeof value !== 'string' || value === '') {
    throw new Error(
      `\`supabase status -o json\` has no ${field}. Update the Supabase CLI or restart it with \`npx supabase start\`.`,
    );
  }
  return value;
}

export function localSupabaseEnv(): LocalSupabaseEnv {
  const status = readStatus();
  const url = requireField(status, 'API_URL');
  const publishableKey = requireField(status, 'PUBLISHABLE_KEY');

  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(
      `Refusing to run tests against a non-local Supabase (${hostname}). Tests may only reach 127.0.0.1 or localhost.`,
    );
  }

  return {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  };
}
