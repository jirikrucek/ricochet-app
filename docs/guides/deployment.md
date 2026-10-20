# Deployment

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

## Environment variables

Set these in the Vercel project settings for both Preview and Production. Vite inlines them at build time, so a change needs a redeploy.

| Variable | Required | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | The Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | The publishable key (`sb_publishable_…`) from the Supabase dashboard, under API keys. The app fails at start-up without it. |
| `VITE_SENTRY_DSN` | No | The Sentry DSN. Leave unset to disable error reporting (see `docs/standards/observability.md`). |