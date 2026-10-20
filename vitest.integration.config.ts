import {
  defineConfig,
  type TestProjectInlineConfiguration,
} from 'vitest/config';

import { resolve } from './vitest.unit.config.ts';

// The global setup finds the local Supabase when this project runs, so
// selecting only the unit projects never needs it.
export function integrationProject(): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      name: 'integration',
      include: ['src/**/*.integration.test.ts'],
      environment: 'node',
      globalSetup: './tests/support/vitestLocalSupabase.ts',
    },
  };
}

export default defineConfig({
  resolve,
  test: { projects: [integrationProject()] },
});
