import { defineConfig, type TestProjectInlineConfiguration } from 'vitest/config';

import { localSupabaseEnv } from './tests/support/localSupabaseEnv';
import { resolve } from './vitest.unit.config';

// Process env set here wins over .env* files, so integration tests reach only
// the local Supabase the helper found (docs/standards/testing.md).
export function integrationProject(): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      name: 'integration',
      include: ['src/**/*.integration.test.ts'],
      environment: 'node',
      env: localSupabaseEnv(),
    },
  };
}

export default defineConfig({
  resolve,
  test: { projects: [integrationProject()] },
});
