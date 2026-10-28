# Observability

How to verify instrumentation and set up alerts. The rules they must satisfy are in `docs/standards/observability-standard.md`.

## Verify instrumentation

Before calling instrumentation done for a change:

1. Set `VITE_SENTRY_DSN` to a real DSN in `.env.local`, throw a test error locally, and confirm it lands in Sentry with the expected `extra` context (the query or mutation key).
2. Force a render error and confirm the error boundary fallback renders and is translated. Trigger it, don't just review the code.
3. Spot-check that no secrets or tokens appear in anything you logged.

Without a DSN, local dev stays silent by design. That is expected, not a bug.

## Set up an alert

Alert rules live in Sentry, not in the repo.

- Satisfy the Alerting rules in `docs/standards/observability-standard.md`: a symptom, one of two severities, a linked runbook.
- Example of a symptom (page-worthy) versus a cause:

  ```text
  SYMPTOM (page-worthy):                 Not this:
  error rate spike across the app        a single low-severity Sentry.logger.warn call
  a new, unseen error type appears
  ```

- A third severity tier trains people to ignore alerts, so keep to page and ticket.
- Write the runbook as: what the alert means and the first thing to check.

## Revisit

`tracesSampleRate` is `1.0` in `src/lib/sentry.ts`, which is fine at current traffic. Lower it if ingestion volume or cost becomes a concern before considering a second vendor.
