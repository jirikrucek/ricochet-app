import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

export const sentryEnabled = Boolean(dsn);

// No-ops (capture calls become silent) when VITE_SENTRY_DSN is unset, so local
// dev and preview environments without a DSN configured don't need special-casing.
// The router is passed in so traces are named by route pattern (/tournaments/$id)
// rather than raw URL.
export function initSentry(
  router: Parameters<typeof Sentry.tanstackRouterBrowserTracingIntegration>[0],
) {
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
    tracesSampleRate: 1.0,
  });
}

export { Sentry };
