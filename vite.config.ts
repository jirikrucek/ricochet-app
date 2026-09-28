import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tanstackRouter(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
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
});
