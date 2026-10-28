# ADR 0014: Report Client Errors and Logs to Sentry

- Status: Accepted
- Created: 2026-10-28
- Updated: 2026-10-28

## Context

The app is a client-only SPA with no application server (ADR 0001), so there are no server logs. An error that happens in a **visitor**'s browser goes unseen unless the client reports it somewhere.

The app needs failed queries, render errors and diagnostic logs reported in one place, and traces grouped by route pattern rather than raw URL, which needs integration with TanStack Router (ADR 0002).

## Decision

Report client errors, traces and structured logs to Sentry through `@sentry/react`.

- One Sentry client, initialised once before render (`src/lib/sentry.ts`) with the TanStack Router tracing integration.
- Failed queries and mutations reach Sentry through the shared TanStack Query cache handlers, and render errors through `AppErrorBoundary`.
- Code logs with `Sentry.logger` instead of `console`.
- Reporting is enabled only where `VITE_SENTRY_DSN` is set. Preview and Production deployments report to separate Sentry projects; local development and tests leave it unset.

`docs/standards/observability-standard.md` holds the rules every change follows. This ADR records the choice of tool and why.

## Alternatives Considered

- No error reporting tool. Rejected: with no server, client errors would never reach the team.
- No DSN in Preview. Rejected: errors found while reviewing a Preview deployment would go unreported.
- One Sentry project for Preview and Production. Rejected: both are Vite production builds, so the SDK's `environment` tag is `production` for both, and Preview errors would mix into Production's issues.

## Consequences

- Positive: one SDK covers the React error boundary, TanStack Router tracing and structured logs.
- Positive: the free tier covers the app's traffic.
- Negative: `Sentry.logger` calls spread through the code, and the observability standard is written around Sentry, so switching tools touches both.
- Negative: Sentry's origins must stay in the Content Security Policy in `vercel.json`, and the SDK adds its own chunk to the bundle.
- Positive: errors in Preview deployments are reported without mixing into Production's issues.
- Negative: a second Sentry project to set up, and Preview events count toward the plan's quota.
