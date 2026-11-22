import { execFileSync } from 'node:child_process';

// The only way a test reaches a database (docs/standards/testing-standard.md, ADR 0011).
// Reads the running local Supabase from the CLI instead of from .env* files,
// so a developer's .env.local pointing at a hosted project can't leak in.
// It also starts the local Supabase for the test scripts that need it.

export type LocalSupabaseEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
};

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

// `--no-install` makes npx fail when node_modules has no `supabase`, instead of
// downloading the latest CLI from the registry in place of the pinned one.
const SUPABASE_CLI = ['--no-install', 'supabase'];

const NOT_RUNNING_MESSAGE =
  'Local Supabase is not running. Integration and E2E tests need it: start Docker, then run `npx supabase start` (see docs/guides/testing-guide.md).';
const NOT_INSTALLED_MESSAGE =
  'The Supabase CLI is not installed in node_modules. Run `npm ci`, then rerun the tests.';
const START_FAILED_MESSAGE =
  'Could not start the local Supabase. Integration and E2E tests need it: check that Docker is running, read the `supabase start` output above for the reason, then rerun the tests (see docs/guides/testing-guide.md).';

class SupabaseCliNotInstalledError extends Error {}

function readStatus(): Record<string, unknown> {
  let output: string;
  try {
    output = execFileSync('npx', [...SUPABASE_CLI, 'status', '-o', 'json'], {
      encoding: 'utf8',
      // The CLI prints notices (stopped services, updates) on stderr.
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = (error as { stderr?: unknown }).stderr;
    // npm 10's npx wording when `--no-install` refuses to download the CLI. If
    // it changes, this still fails closed, just with the not-running message.
    if (typeof stderr === 'string' && stderr.includes('missing packages')) {
      throw new SupabaseCliNotInstalledError(NOT_INSTALLED_MESSAGE, {
        cause: error,
      });
    }
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

// Why `supabase status` failed, in one line, or undefined when it runs.
function statusFailure(): string | undefined {
  try {
    readStatus();
    return undefined;
  } catch (error) {
    // Starting Supabase can't fix a missing CLI.
    if (error instanceof SupabaseCliNotInstalledError) {
      throw error;
    }
    const cause = error instanceof Error ? error.cause : undefined;
    const stderr = (cause as { stderr?: unknown } | undefined)?.stderr;
    const reason =
      typeof stderr === 'string' && stderr.trim() !== ''
        ? stderr
        : cause instanceof Error
          ? cause.message
          : String(cause);
    return reason.trim().split('\n')[0];
  }
}

// Run by the test:integration and test:e2e scripts (startLocalSupabase.ts)
// before their runner, so a fresh dev container needs no manual
// `supabase start`. It runs outside the runners because Playwright starts its
// web server, whose timeout a first start (image pulls) exceeds, before its
// global setup.
export function ensureLocalSupabaseRunning() {
  const failure = statusFailure();
  if (failure === undefined) return;

  console.log(
    `Local Supabase is not running (supabase status: ${failure}). Starting it with \`npx supabase start\`; the first start downloads the images and can take several minutes.`,
  );
  try {
    execFileSync('npx', [...SUPABASE_CLI, 'start'], { stdio: 'inherit' });
  } catch (error) {
    throw new Error(START_FAILED_MESSAGE, { cause: error });
  }
}
