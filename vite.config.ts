import { defineConfig, loadEnv, type UserConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const config: UserConfig = {
  plugins: [tanstackRouter(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  define: {
    // Vercel sets VERCEL_ENV to production, preview or development at build time.
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(
      process.env.VERCEL_ENV ?? '',
    ),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      // 'use client' directives in deps (e.g. @base-ui) only matter for RSC; this is a CSR SPA.
      onwarn(warning, defaultHandler) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        defaultHandler(warning);
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }
          if (id.includes('@sentry')) {
            return 'sentry';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          if (id.includes('i18next')) {
            return 'i18n';
          }
          if (id.includes('@base-ui') || id.includes('lucide-react')) {
            return 'ui';
          }
          return 'vendor';
        },
      },
    },
  },
};

// The headers Vercel serves, so the E2E suite runs under the production
// Content Security Policy (tests/support/previewHeaders.ts). Loaded only for
// `vite preview`, so a build never depends on them or on tests/.
async function vercelHeaders(mode: string) {
  const { previewHeaders, readVercelConfig } =
    await import('./tests/support/previewHeaders');
  return previewHeaders(
    readVercelConfig(),
    loadEnv(mode, import.meta.dirname, 'VITE_').VITE_SUPABASE_URL,
  );
}

export default defineConfig(async ({ mode, isPreview }) => ({
  ...config,
  preview: isPreview ? { headers: await vercelHeaders(mode) } : undefined,
}));
