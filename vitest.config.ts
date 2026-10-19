import { defineConfig } from 'vitest/config';

import { integrationProject } from './vitest.integration.config';
import { resolve, unitProjects } from './vitest.unit.config';

export default defineConfig({
  resolve,
  test: { projects: [...unitProjects, integrationProject()] },
});
