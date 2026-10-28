# Observability

How to verify instrumentation and set up alerts. The rules they must satisfy are in `docs/standards/observability-standard.md`.

## Verify instrumentation

Before calling instrumentation done for a change, run the app with `npm run dev` and a real DSN in `.env.local` (`VITE_SENTRY_DSN`). Make each temporary edit below, check the result, then revert it.

1. **Failed query.** Make a `queryFn` throw, for example `queryFn: () => { throw new Error('sentry test'); }` in `src/features/players/api/usePlayers.ts`. Open the page and confirm the error lands in Sentry with `extra.queryKey` set. For a mutation, check `extra.mutationKey`.
2. **Render error.** Throw during render, for example `throw new Error('render test')` at the top of `PlayerOverview` in `src/features/players/components/PlayerOverview.tsx`. Confirm `AppErrorBoundary` shows the fallback screen in the selected language and the error lands in Sentry.
3. Spot-check that no secrets or tokens appear in anything you logged.

Without a DSN, local dev stays silent by design. That is expected, not a bug.

## Set up an alert

Alert rules live in Sentry, not in the repo. Satisfy the Alerting rules in `docs/standards/observability-standard.md`. Write the runbook as: what the alert means and the first thing to check.
