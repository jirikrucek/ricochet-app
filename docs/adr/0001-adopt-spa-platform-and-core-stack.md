# ADR 0001: Adopt SPA Platform and Core Stack

- Status: Accepted
- Date: 2026-07-21

## Context

Ricochet App must run as a single packaged web app across mobile, tablet, desktop, and TV-sized screens. The project also requires long-term maintainability, fast feedback for iterative delivery, and clear FE/BE boundaries.

## Decision

Adopt the following platform-level stack:

- React + TypeScript for the frontend SPA (CSR).
- Vite as the build and development toolchain.
- Supabase as backend platform:
  - PostgreSQL for relational tournament/player data.
  - Auth for user identity and role-aware access.
  - Realtime for live updates (scores, bracket changes).
  - Row-Level Security (RLS) for access control.
- Vercel for deployment and preview environments.
- Vitest for unit/integration tests and Playwright for end-to-end coverage.

## Consequences

- Positive:
  - Mature, common technologies with strong ecosystem support.
  - Fast local development and test loops.
  - Real-time tournament UX without bespoke socket infrastructure.
  - Clear path to role-based security with RLS.
- Tradeoffs:
  - Supabase feature use (Auth/Realtime policies) requires disciplined schema and policy design.
  - SPA architecture places more responsibility on frontend data and state orchestration.

## Notes

This ADR defines the baseline platform. Detailed frontend patterns (routing, server/client state boundaries, and forms) are captured in ADR 0002.