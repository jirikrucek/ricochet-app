# Observability

This is a client-only SPA (ADR 0001) — there is no application server to instrument. "Observability" here means: client errors reach Sentry, logs are structured and queryable, and user-facing symptoms (not backend causes, since there is no backend tier we operate) are what get alerted on.

For any change that adds a Supabase call, a new route, or a background/retry path:
- Read this file first.

## Error reporting baseline

Already wired in `src/app/observability/`:
- `sentry.ts` — `initSentry()`, called once in `main.tsx` before render. No-ops when `VITE_SENTRY_DSN` is unset (local dev and any environment without a DSN configured). Enables `browserTracingIntegration` (`tracesSampleRate: 1.0`) and `enableLogs`. Session Replay is deliberately **not** enabled yet — revisit once there are real screens worth replaying; if it's added later, keep the SDK's default text/input masking on.
- `AppErrorBoundary.tsx` — wraps the app in `AppProviders.tsx`. Catches render errors, reports them to Sentry, and shows a translated fallback screen instead of a white screen.
- `AppProviders.tsx` — the shared `QueryClient` has `QueryCache`/`MutationCache` `onError` hooks that report every failed query and mutation to Sentry with the query/mutation key attached. Components are never required to handle an error just so it gets reported — component-level `onError`/error UI is still fine for user-facing messaging, but don't rely on it for visibility.

The DSN is deliberately **not** committed to `.env.example` (it stays blank) — set the real `VITE_SENTRY_DSN` per environment in Vercel's project settings. Local dev without a DSN set stays silent by design; that's expected, not a bug.

## Structured logging

Use `Sentry.logger.*` (from `src/app/observability/sentry.ts`) instead of `console.*` — it requires `enableLogs`, already on, and ships structured attributes to the same place errors go, with no separate vendor to run.

- Pick the level deliberately (`trace`/`debug`/`info`/`warn`/`error`/`fatal`) — see the level table in this skill's process for what each implies for on-call.
- Pass structured `attributes`, not an interpolated string:
  ```ts
  // BAD
  Sentry.logger.error(`Failed to load tournament ${id}: ${err.message}`);

  // GOOD
  Sentry.logger.error('tournament_load_failed', { tournamentId: id, error: err.message });
  ```
- Never log Supabase access/refresh tokens, the anon key, or full user records — allowlist fields.
- `Sentry.logger.*` is for diagnostic detail; `Sentry.captureException` (already wired for query/mutation/render errors) remains the right call for actual failures — don't replace that with `logger.error`.
- `console.*` should not appear in application code once this is in place — it isn't structured and isn't captured anywhere.

## Correlation

Every Supabase error/log reported to Sentry should carry enough context to find the request in Supabase's own logs: the table/RPC name and the relevant row id(s), attached via `attributes`/`extra` (see the `QueryCache`/`MutationCache` wiring in `AppProviders.tsx` for the pattern). There is no custom request-id header to propagate — Supabase's own request logging is the source of truth on the backend side; our job is to log enough to find the matching entry there.

## RUM / performance

`browserTracingIntegration` is enabled, giving route-change and page-load performance in Sentry's Performance view — no separate RUM vendor needed. `tracesSampleRate: 1.0` is fine at current traffic; revisit (lower it) if ingestion volume/cost becomes a concern before a second vendor is ever considered.

If a custom metric/span attribute is ever added, it must use a bounded label set (route template, status class) — never a user id, raw URL, or error message text as a label/tag.

## Alerting

Configure Sentry alert rules on symptoms, not causes:

```
SYMPTOM (page-worthy):                 Not this (no cause-level signal exists yet):
error rate spike across the app        a single low-severity Sentry.logger.warn call
a new, unseen error type appears
```

Every alert must link to a short runbook (what it means, first thing to check) and use two severities only — page (act now) vs. ticket (act this week). Don't create a third tier; it trains people to ignore alerts.

## Verification

Before calling instrumentation done for a change:
- Throw a test error locally with `VITE_SENTRY_DSN` set to a real DSN and confirm it lands in Sentry with the expected `extra` context.
- Confirm the error boundary fallback renders (and is translated) for a forced render error — don't just review the code, trigger it.
- Spot-check that no secrets/tokens appear in whatever you logged.
