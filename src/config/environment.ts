// `VITE_VERCEL_ENV` is set at build time from Vercel's `VERCEL_ENV` (see
// vite.config.ts). It is empty outside Vercel, so local dev shows no label.
export function isPreviewEnvironment() {
  return import.meta.env.VITE_VERCEL_ENV === 'preview';
}
