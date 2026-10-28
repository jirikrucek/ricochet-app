# ADR 0013: Preview and Production Use Separate Supabase Projects

- Status: Accepted
- Created: 2026-10-28
- Updated: 2026-10-28

## Context

Vercel builds a Preview deployment for every pull request and a Production deployment from `main` (ADR 0001). Each reads its Supabase URL and publishable key from Vercel environment variables, so each can point at its own Supabase project or at the same one.

Until now one Supabase project served both. A migration applied by hand for a pull request then changed Production before the pull request was reviewed or merged, and a Preview could not try out a schema change without Production seeing it.

## Decision

Preview and Production deployments use separate Supabase projects. Vercel's Preview environment variables point at the Preview project, and its Production environment variables at the Production project.

- Both projects hold the **production data**, loaded by hand with the same idempotent scripts kept outside Git.
- Migrations and **production data** scripts are applied by hand: to the Preview project while the pull request is open, then to the Production project right before merging (`docs/guides/deployment-guide.md`).

Tests use neither project; they reach only a local Supabase with **seed data** (ADR 0011).

## Alternatives Considered

- One Supabase project shared by Preview and Production. Rejected: a migration for an unmerged pull request changes Production, and a Preview can't try out a schema change safely.
- **Seed data** in the Preview project. Rejected: a Preview would then show different **players** from Production.
- Applying migrations from CI. Rejected for now: it needs Supabase access tokens as CI secrets, and the current release flow is already manual.

## Consequences

- Positive: Production changes only when a release is ready, and a schema change can be tried on a Preview first.
- Positive: a Preview shows the same real **players** as Production.
- Negative: **production data** lives in two projects, so each script runs twice, and the two copies can drift if one run is missed.
- Negative: every database change is applied twice by hand, relinking the Supabase CLI between projects. Applying to the wrong project is easy to do by mistake.
- Negative: a second Supabase project to keep within the plan's project limit or to pay for.
- Follow-up: all open pull requests share the one Preview project, so two pull requests with conflicting migrations can't be previewed at the same time.
