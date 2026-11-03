# ADR 0018: Trusted Business Rules Live in the Backend

- Status: Accepted
- Created: 2026-11-02
- Updated: 2026-11-03
- Supersedes: ADR 0012

## Context

The app is a client-only SPA with no application server (ADR 0001). A **visitor** can read and change any code running in their browser, so the client can't enforce anything.

ADR 0012 placed business rules in a client-side `src/domain/`, including scoring, bracket and permission rules still to come. Those rules decide results and access, so they can't depend on the browser. The database already enforces some rules this way, such as the check constraint on a **player**'s **nationality**.

## Decision

Rules whose results must be trusted live in Supabase, in `supabase/`. The client only asks for results and displays them.

| Kind of logic | Where it lives | Example |
| :--- | :--- | :--- |
| Permissions and integrity | RLS and constraints | Who can edit a tournament |
| Rules that produce trusted results | Postgres functions and views, or Edge Functions | Scoring, brackets, ranking points |
| Input checks for quick feedback | Client as well, with the backend still enforcing them | Form validation |
| Presentation and view state | Client | Name formatting, URL filters |

A client may show a preview of a result for instant feedback, but the backend's result is the one that counts.

The test is whether a wrong result would matter if a **visitor** tampered with it. If so, the rule belongs in the backend. If it only affects what that **visitor** sees, it can stay in the client.

## Alternatives Considered

- Business rules in the client, as in ADR 0012. Rejected: anyone can bypass them, and RLS would then be the only protection, with no way to check that a computed result is correct.
- Writing each rule in both client and backend so the client can respond instantly. Rejected: the two copies drift apart, and the backend must be correct anyway. Only quick-feedback checks, such as form validation, are repeated in the client.

## Consequences

- Positive: results stay correct whatever a browser sends, and every **module** reads the same result.
- Positive: `src/` stays free of scoring and bracket logic, so the `domain/` folders hold only **domain types** and small presentation and view helpers.
- Negative: SQL logic is harder to refactor than TypeScript, and every rule change needs a migration.
- Negative: each trusted result needs a backend round trip, so screens that need instant feedback, such as live scoring, may need a client-side preview.
- Negative: more logic in Postgres ties the app more closely to Supabase.
- Follow-up: backend rules are tested with integration tests against a local Supabase (ADR 0011).

## Notes

- Filtering, sorting and paging only affect what a **visitor** sees, so this ADR doesn't require them in the backend. They moved there for a different reason: the cost of loading a whole list (ADR 0020).
