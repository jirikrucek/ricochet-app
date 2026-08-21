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
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
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
          type: 'client-api',
          pattern: 'src/client-api/**',
          partialMatch: false,
        },
        // More specific than 'features' below — must be declared first,
        // since the matcher takes the first element pattern that matches
        // a file. This is the only part of a feature allowed to import
        // client-api.
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
              // add 'domain', 'client-api' here once an auth session store lands
              allow: {
                to: { element: { types: ['ui', 'localization', 'lib'] } },
              },
            },
            {
              from: { element: { type: 'routes' } },
              allow: {
                to: {
                  element: {
                    types: ['app', 'features', 'lib'],
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
              // the seam: calls client-api, maps the result through a
              // domain mapper, and returns a domain type to the rest of
              // the feature (ADR 0003)
              allow: [
                {
                  to: { element: { types: ['client-api', 'domain', 'lib'] } },
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
              from: { element: { type: 'client-api' } },
              allow: { to: { element: { type: 'lib' } } },
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
              message: 'Import Supabase only inside src/client-api (ADR 0003).',
            },
            {
              from: { element: { type: 'client-api' } },
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
  prettierConfig,
);
