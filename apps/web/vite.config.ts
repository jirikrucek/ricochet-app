import { defineConfig } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [tanstackRouter()],
  server: {
    port: 5173,
  },
});
