# Observability

This is a client-only SPA ([ADR 0001](../adr/ADR0001-adopt-spa-platform-and-core-stack.md)) — there is no application server to instrument. Observability here means: client errors reach Sentry, logs are structured and queryable, and what gets alerted on are user-facing symptoms, not backend causes.

## Error reporting

Error reporting is wired once in `src/app/observability/` and `src/app/providers/AppProviders.tsx`:

- `initSentry(router)` runs once in `main.tsx` before render. It does nothing when `VITE_SENTRY_DSN` is unset, so local dev needs no special-casing. The DSN stays blank in `.env.example` and is set per environment (see [deployment guide](../guides/deployment.md)).
- `AppErrorBoundary` wraps the app, reports render errors, and shows a translated fallback screen.
- The shared `QueryClient` reports every failed query and mutation through its `QueryCache`/`MutationCache` `onError`, with the query or mutation key attached.

Rules:

- **Don't add error reporting to a component just so a failure is seen.** A query or mutation failure is already reported; component-level error UI is only for user-facing messaging.
- **Don't swallow errors.** A `catch` either rethrows or calls `Sentry.captureException`. This holds for any background or retry path: the failure after the last attempt must reach Sentry.
- **Every query key must identify the data it fetches** (table or RPC name and the row ids involved), because it is the only context the shared `onError` attaches. It is what lets you find the request in Supabase's own logs; there is no custom request-id header.
- **Session Replay is not enabled.** If it is added, keep the SDK's default text and input masking on.

## Structured logging

Use `Sentry.logger.*` (exported by `src/app/observability/sentry.ts`) instead of `console.*`. `console.*` must not appear in application code: it isn't structured and isn't captured anywhere.

- Pick the level deliberately: `trace`, `debug`, `info`, `warn`, `error` or `fatal`.
- Pass structured `attributes`, not an interpolated string:
  ```ts
  // BAD
  Sentry.logger.error(`Failed to load tournament ${id}: ${err.message}`);

  // GOOD
  Sentry.logger.error('tournament_load_failed', { tournamentId: id, error: err.message });
  ```
- Never log Supabase access or refresh tokens, the publishable key, or full user records. Log an allowlist of fields.
- `Sentry.logger.*` is for diagnostic detail. Actual failures go to `Sentry.captureException`; don't replace it with `logger.error`.

## Performance

Route-change and page-load performance comes from `tanstackRouterBrowserTracingIntegration(router)`, with transactions named by route pattern (`/tournaments/$id`), not raw URL. A new route needs no extra wiring. No separate RUM vendor is used.

A custom metric or span attribute must use a bounded label set (route template, status class) — never a user id, raw URL, or error message text.

## Alerting

Alert on symptoms, not causes (an app-wide error-rate spike, a new unseen error type), never on a single low-severity `Sentry.logger.warn`. Every alert uses one of two severities, page (act now) or ticket (act this week), and links to a short runbook. How to set up and verify them is in the [observability guide](../guides/observability.md).
