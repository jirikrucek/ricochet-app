import { ensureLocalSupabaseRunning } from './localSupabaseEnv.ts';

// Entry point for the test scripts; see ensureLocalSupabaseRunning.
try {
  ensureLocalSupabaseRunning();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
