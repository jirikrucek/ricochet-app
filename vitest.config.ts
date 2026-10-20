import { defineConfig } from 'vitest/config';

import { integrationProject } from './vitest.integration.config.ts';
import { resolve, unitProjects } from './vitest.unit.config.ts';

export default defineConfig({
  resolve,
  test: { projects: [...unitProjects, integrationProject()] },
});
