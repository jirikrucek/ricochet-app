import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';
import globals from 'globals';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

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
      // nested ones (src/localization/locales/en.ts) — the plugin's default
      // matching only matches files nested one level under a matched
      // subfolder, so it silently fails to classify flat top-level files.
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**', partialMatch: false },
        { type: 'domain', pattern: 'src/domain/**', partialMatch: false },
        {
          type: 'repositories',
          pattern: 'src/repositories/**',
          partialMatch: false,
        },
        // More specific than 'features' below — must be declared first,
        // since the matcher takes the first element pattern that matches
        // a file. This is the only part of a feature allowed to import
        // repositories.
        {
          type: 'features-api',
          pattern: 'src/features/*/api/**',
          partialMatch: false,
          capture: ['feature'],
        },
        {
          type: 'features',
          pattern: 'src/features/*/**',
          partialMatch: false,
          capture: ['feature'],
        },
        { type: 'routes', pattern: 'src/routes/**', partialMatch: false },
        { type: 'ui', pattern: 'src/ui/**', partialMatch: false },
        {
          type: 'localization',
          pattern: 'src/localization/**',
          partialMatch: false,
        },
        { type: 'lib', pattern: 'src/lib/**', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // also check module dependencies (external packages), not just
          // local elements, so the Supabase policy below can be expressed
          // here instead of in the separate (now deprecated) 'external' rule
          checkAllOrigins: true,
          message: '{{from.type}} is not allowed to import {{to.type}}',
          policies: [
            {
              from: { element: { type: 'app' } },
              // add 'domain', 'repositories' here once an auth session store lands
              allow: {
                to: { element: { types: ['ui', 'localization', 'lib'] } },
              },
            },
            {
              from: { element: { type: 'routes' } },
              allow: {
                to: {
                  element: {
                    types: ['app', 'features', 'domain', 'lib'],
                  },
                },
              },
            },
            {
              from: { element: { type: 'features' } },
              allow: [
                {
                  to: {
                    element: {
                      types: ['domain', 'ui', 'localization', 'lib'],
                    },
                  },
                },
                {
                  to: {
                    element: {
                      type: 'features',
                      captured: { feature: '{{from.captured.feature}}' },
                    },
                  },
                },
                {
                  to: {
                    element: {
                      type: 'features-api',
                      captured: { feature: '{{from.captured.feature}}' },
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'features-api' } },
              // the seam: wraps a repository (which already returns
              // domain types) in TanStack Query hooks for the rest of
              // the feature (ADR 0012)
              allow: [
                {
                  to: { element: { types: ['repositories', 'domain', 'lib'] } },
                },
                {
                  to: {
                    element: {
                      type: 'features-api',
                      captured: { feature: '{{from.captured.feature}}' },
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'repositories' } },
              // the adapter: maps Supabase rows to domain types and
              // validates them with domain schemas (ADR 0012)
              allow: { to: { element: { types: ['domain', 'lib'] } } },
            },
            {
              from: { element: { type: 'ui' } },
              allow: { to: { element: { type: 'lib' } } },
            },
            {
              from: { element: { type: 'localization' } },
              allow: { to: { element: { types: ['ui', 'lib'] } } },
            },
            {
              from: { element: { type: 'domain' } },
              allow: { to: { element: { type: 'domain' } } },
            },
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
              message:
                'Import Supabase only inside src/repositories (ADR 0012).',
            },
            {
              from: { element: { type: 'repositories' } },
              allow: {
                to: {
                  module: {
                    origin: ['external', 'core'],
                    source: '@supabase/supabase-js',
                  },
                },
              },
            },
          ],
        },
      ],
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
          patterns: [
            {
              group: ['..', '../**'],
              message:
                "Import files outside this folder with the '@/' alias instead of '../'.",
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
