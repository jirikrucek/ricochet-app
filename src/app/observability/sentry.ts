import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

export const sentryEnabled = Boolean(dsn);

// No-ops (capture calls become silent) when VITE_SENTRY_DSN is unset, so local
// dev and preview environments without a DSN configured don't need special-casing.
export function initSentry() {
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
    enableLogs: true,
  });
}

export { Sentry };
