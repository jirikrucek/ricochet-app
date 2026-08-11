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
      // 'file' mode + '**' matches both flat files (src/ui/select.tsx) and
      // nested ones (src/localization/locales/en.ts) — 'folder' mode (the
      // plugin default) only matches files nested one level under a matched
      // subfolder, so it silently fails to classify flat top-level files.
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**', mode: 'file' },
        { type: 'domain', pattern: 'src/domain/**', mode: 'file' },
        { type: 'client-api', pattern: 'src/client-api/**', mode: 'file' },
        // More specific than 'features' below — must be declared first,
        // since the matcher takes the first element pattern that matches
        // a file. This is the only part of a feature allowed to import
        // client-api.
        {
          type: 'features-api',
          pattern: 'src/features/*/api/**',
          mode: 'file',
          capture: ['feature'],
        },
        {
          type: 'features',
          pattern: 'src/features/*/**',
          mode: 'file',
          capture: ['feature'],
        },
        { type: 'routes', pattern: 'src/routes/**', mode: 'file' },
        { type: 'ui', pattern: 'src/ui/**', mode: 'file' },
        { type: 'localization', pattern: 'src/localization/**', mode: 'file' },
        { type: 'lib', pattern: 'src/lib/**', mode: 'file' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} is not allowed to import ${dependency.type}',
          rules: [
            {
              from: 'app',
              // add 'domain', 'client-api' here once an auth session store lands
              allow: ['ui', 'localization', 'lib'],
            },
            {
              from: 'routes',
              allow: ['app', 'features', 'ui', 'localization', 'lib'],
            },
            {
              from: 'features',
              allow: [
                'domain',
                'ui',
                'localization',
                'lib',
                ['features', { feature: '${from.feature}' }],
                ['features-api', { feature: '${from.feature}' }],
              ],
            },
            {
              from: 'features-api',
              // the seam: calls client-api, maps the result through a
              // domain mapper, and returns a domain type to the rest of
              // the feature (ADR 0003)
              allow: [
                'client-api',
                'domain',
                'lib',
                ['features-api', { feature: '${from.feature}' }],
              ],
            },
            { from: 'client-api', allow: ['lib'] },
            { from: 'ui', allow: ['lib'] },
            { from: 'localization', allow: ['ui', 'lib'] },
            { from: 'domain', allow: ['domain'] },
            { from: 'lib', allow: [] },
          ],
        },
      ],
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: '*',
              disallow: ['@supabase/supabase-js'],
              message: 'Import Supabase only inside src/client-api (ADR 0003).',
            },
            {
              from: 'client-api',
              allow: ['@supabase/supabase-js'],
            },
          ],
        },
      ],
    },
  },
  prettierConfig,
);
