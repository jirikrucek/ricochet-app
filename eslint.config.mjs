import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const parentImportsPattern = {
  group: ['..', '../**'],
  message:
    "Import files outside this folder with the '@/' alias instead of '../'.",
};

const uiAndDataPackagesPatterns = {
  group: [
    'react',
    'react/*',
    'react-dom',
    'react-dom/*',
    '@tanstack/*',
    'i18next',
    'react-i18next',
  ],
};

// A layer of the same feature as the importing file. Other features match no
// policy, so they stay disallowed.
const ownFeature = (...types) =>
  types.map((type) => ({
    to: {
      element: {
        type,
        captured: { feature: '{{from.captured.feature}}' },
      },
    },
  }));

const layers = (...types) => ({ to: { element: { types } } });

// One file of a layer, for the few layers that are open only in part.
const fileOf = (type, path) => ({ to: { element: { type }, file: { path } } });

const layerPolicy = (type, ...allow) => ({
  from: { element: { type } },
  allow,
});

const languagesFile = fileOf('locales', 'src/locales/languages.ts');

const boundaryPolicies = [
  layerPolicy('routes', layers('app', 'feature-components', 'feature-types')),
  layerPolicy(
    'app',
    layers(
      'feature-components',
      'components',
      'hooks',
      'store',
      'types',
      'utils',
      'ui',
      'lib',
      'config',
    ),
  ),
  layerPolicy(
    'feature-components',
    ...ownFeature(
      'feature-hooks',
      'feature-store',
      'feature-types',
      'feature-utils',
    ),
    layers('components', 'hooks', 'store', 'types', 'utils', 'ui', 'config'),
    languagesFile,
  ),
  layerPolicy(
    'feature-hooks',
    ...ownFeature(
      'feature-api',
      'feature-store',
      'feature-types',
      'feature-utils',
    ),
    layers('api', 'hooks', 'store', 'types', 'utils', 'config'),
    fileOf('lib', 'src/lib/sentry.ts'),
    languagesFile,
  ),
  layerPolicy(
    'feature-api',
    ...ownFeature('feature-types', 'feature-utils'),
    layers('api', 'types', 'utils', 'db'),
  ),
  layerPolicy(
    'feature-store',
    ...ownFeature('feature-types', 'feature-utils'),
    layers('types', 'utils'),
  ),
  layerPolicy(
    'feature-utils',
    ...ownFeature('feature-types'),
    layers('types', 'utils'),
  ),
  layerPolicy('feature-types', layers('types')),
  layerPolicy(
    'components',
    layers('ui', 'hooks', 'store', 'types', 'utils', 'config'),
    languagesFile,
  ),
  layerPolicy(
    'hooks',
    layers('api', 'store', 'types', 'utils', 'config'),
    fileOf('lib', 'src/lib/sentry.ts'),
    languagesFile,
  ),
  layerPolicy('api', layers('db', 'types', 'utils')),
  layerPolicy('store', layers('types', 'utils')),
  layerPolicy('utils', layers('types')),
  layerPolicy('ui', layers('utils')),
  layerPolicy('lib', layers('config', 'locales')),
  {
    allow: {
      to: { module: { origin: ['external', 'core'] } },
    },
  },
  {
    disallow: {
      to: {
        module: {
          origin: ['external', 'core'],
          source: '@supabase/supabase-js',
        },
      },
    },
    message: 'Import Supabase only inside src/db and the api folders.',
  },
  ...['db', 'api', 'feature-api'].map((type) => ({
    from: { element: { type } },
    allow: {
      to: {
        module: {
          origin: ['external', 'core'],
          source: '@supabase/supabase-js',
        },
      },
    },
  })),
];

const dependencyRule = (policies) => [
  'error',
  {
    default: 'disallow',
    // also check module dependencies (external packages), not just
    // local elements, so the Supabase policy can be expressed here instead of
    // in the separate (now deprecated) 'external' rule
    checkAllOrigins: true,
    message: '{{from.type}} is not allowed to import {{to.type}}',
    policies,
  },
];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-e2e/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.playwright-browsers/**',
      'supabase/.temp/**',
      'supabase/.branches/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // route files export `Route` next to a local page component by design
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      // Required: the default resolver only understands .js/.json, so without
      // the TypeScript one extensionless imports ('./languages') go
      // unresolved and every boundaries rule silently stops checking them.
      'import/resolver': {
        typescript: true,
      },
      'boundaries/include': ['src/**/*'],
      // 'partialMatch: false' matches both flat files (src/ui/select.tsx) and
      // nested ones (src/locales/en.ts) — the plugin's default matching only
      // matches files nested one level under a matched subfolder, so it
      // silently fails to classify flat top-level files. Assets have no element:
      // an unclassified import is not checked, so every layer can use them.
      'boundaries/elements': [
        { type: 'routes', pattern: 'src/routes/**', partialMatch: false },
        { type: 'app', pattern: 'src/app/**', partialMatch: false },
        ...['api', 'components', 'hooks', 'store', 'types', 'utils'].flatMap(
          (layer) => [
            {
              type: `feature-${layer}`,
              pattern: `src/features/*/${layer}/**`,
              partialMatch: false,
              capture: ['feature'],
            },
            { type: layer, pattern: `src/${layer}/**`, partialMatch: false },
          ],
        ),
        { type: 'ui', pattern: 'src/ui/**', partialMatch: false },
        { type: 'db', pattern: 'src/db/**', partialMatch: false },
        { type: 'lib', pattern: 'src/lib/**', partialMatch: false },
        { type: 'locales', pattern: 'src/locales/**', partialMatch: false },
        { type: 'config', pattern: 'src/config/**', partialMatch: false },
        // No policy allows it: only src/main.tsx, which is outside every
        // element, imports the global stylesheet.
        { type: 'styles', pattern: 'src/styles/**', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': dependencyRule(boundaryPolicies),
      'boundaries/no-unknown-files': 'error',
    },
  },
  {
    // Entry files and generated code sit directly under src/, outside every layer.
    files: [
      'src/main.tsx',
      'src/router.tsx',
      'src/routeTree.gen.ts',
      'src/vite-env.d.ts',
    ],
    rules: { 'boundaries/no-unknown-files': 'off' },
  },
  {
    // Component tests render with the configured i18n instance. Components
    // themselves use useTranslation, which re-renders on a language change.
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      'boundaries/dependencies': dependencyRule([
        ...boundaryPolicies,
        ...['feature-components', 'components'].map((type) =>
          layerPolicy(type, fileOf('lib', 'src/lib/i18n.ts')),
        ),
      ]),
    },
  },
  {
    // docs/standards/project-structure-standard.md: import siblings and children with
    // './', everything else under src/ with '@/'. Use Sentry.logger, not
    // console (docs/standards/observability-standard.md).
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [parentImportsPattern],
        },
      ],
    },
  },
  {
    // docs/standards/project-structure-standard.md: the api folders talk to the
    // backend and know nothing about React or query caching, which hooks own.
    // This replaces the src-wide no-restricted-imports above for these files,
    // so it repeats the '../' pattern.
    files: ['src/api/**/*.{ts,tsx}', 'src/features/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            parentImportsPattern,
            {
              ...uiAndDataPackagesPatterns,
              message:
                'api talks to the backend: no React, TanStack or i18next. Hooks wrap it.',
            },
          ],
        },
      ],
    },
  },
  {
    // docs/standards/project-structure-standard.md: types and utils are pure,
    // so no UI, data-fetching or localization libraries, and no fetch.
    // This replaces the src-wide no-restricted-imports above for these files,
    // so it repeats the '../' pattern.
    files: [
      'src/types/**/*.{ts,tsx}',
      'src/utils/**/*.{ts,tsx}',
      'src/features/*/types/**/*.{ts,tsx}',
      'src/features/*/utils/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'types and utils do not fetch; the api folders do.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            parentImportsPattern,
            {
              ...uiAndDataPackagesPatterns,
              message:
                'types and utils are pure: no React, TanStack or i18next.',
            },
          ],
        },
      ],
    },
  },
  {
    // Pixel baselines are OS- and renderer-specific, so e2e tests must not
    // use them (ADR 0009).
    files: ['tests/e2e/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.property.name=/^(toHaveScreenshot|toMatchSnapshot)$/]',
          message:
            'Pixel snapshots are not allowed in e2e tests: they differ per OS. Assert structure instead (ADR 0009).',
        },
      ],
    },
  },
  prettierConfig,
);
