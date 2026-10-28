# Deployment Guide

This repository is configured for Vercel deployment from the repo root.

## First-time setup in Vercel

1. Import this repository in Vercel.
2. Keep the project Root Directory as the repository root.
3. Confirm the detected settings from `vercel.json`:
   - Install Command: `npm ci` (installs strictly from `package-lock.json`)
   - Build Command: `npm run build`
   - Output Directory: `dist`

## SPA routing

Client-side routes are rewritten to `index.html` via `vercel.json`, so direct navigation to nested routes works in production.

## Content Security Policy

`vercel.json` sets a Content Security Policy whose `connect-src` allows only the app itself, Supabase and Sentry. A request to any other origin is blocked in production, so adding one means adding its origin to `connect-src`. Only Vercel serves these headers: local dev, `vite preview` and the E2E suite don't catch a missing origin.

## Environment variables

Set these in the Vercel project settings for both Preview and Production. Preview and Production use separate Sentry projects (ADR 0014), so each environment gets its own DSN. Vite inlines them at build time, so a change needs a redeploy.

| Variable | Required | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | The Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | The publishable key (`sb_publishable_…`) from the Supabase dashboard, under API keys. The app fails at start-up without it. |
| `VITE_SENTRY_DSN` | Yes | The DSN of the environment's Sentry project. Without it, errors in that environment aren't reported (see `docs/standards/observability-standard.md`). |

## Releasing a database change

A migration, and the data the app needs in it, are not part of the Vercel deploy. They reach the shared database by hand, so run them in this order. A frontend that is deployed first shows its error state until the table exists and holds rows.

Once per machine, authenticate and link the shared project: `npx supabase login`, then `npx supabase link --project-ref <ref>` (the ref is in the Supabase dashboard URL). The link lives in the gitignored `supabase/.temp/`. Both `db push` and `db query --linked` below act on that project.

1. Apply the migrations: `npx supabase db push`.
2. Load the production data. The scripts live in the gitignored `supabase/data/` and are idempotent (`insert … on conflict`, relying on the table's natural key), so running one again is safe. Run each script against the linked project: `npx supabase db query -f ./supabase/data/<script>.sql --linked`. Never run one against a local or CI database (see `docs/standards/testing-standard.md`).
3. Merge, so Vercel deploys the frontend.
4. Smoke-check the deployed app: the page lists rows, and `VITE_SENTRY_DSN` is set so a failure would be reported.

Adding a value the database restricts needs more than a migration. A new nationality needs a migration that widens the `players_nationality_known` check, a flag in `src/localization/flags.ts`, and a name in each locale file.

### Rolling back

Revert the Vercel deploy first. A migration that only adds a table is safe to leave in place, so the previous frontend keeps working. If it must go, drop what it added, for example `drop table public.players; drop type public.player_sex;`.
