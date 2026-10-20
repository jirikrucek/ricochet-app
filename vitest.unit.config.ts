import path from 'node:path';
import {
  defineConfig,
  type TestProjectInlineConfiguration,
} from 'vitest/config';

// Unit tests use mock data only and never reach Supabase
// (docs/standards/testing.md). Component tests (.tsx) need a DOM.
export const unitProjects: TestProjectInlineConfiguration[] = [
  {
    extends: true,
    test: {
      name: 'unit',
      include: ['src/**/*.unit.test.ts', 'tests/support/**/*.unit.test.ts'],
      environment: 'node',
    },
  },
  {
    extends: true,
    test: {
      name: 'unit-dom',
      include: ['src/**/*.unit.test.tsx'],
      environment: 'jsdom',
    },
  },
];

export const resolve = {
  alias: { '@': path.resolve(import.meta.dirname, './src') },
};

export default defineConfig({
  resolve,
  test: { projects: unitProjects },
});
