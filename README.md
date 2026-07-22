# Ricochet App

## Deployment (Vercel)

This repository is configured for Vercel deployment from the repo root.

### First-time setup in Vercel

1. Import this repository in Vercel.
2. Keep the project Root Directory as the repository root.
3. Confirm the detected settings from `vercel.json`:
	- Install Command: `npm install`
	- Build Command: `npm run build -w @ricochet/web`
	- Output Directory: `apps/web/dist`

### SPA routing

Client-side routes are rewritten to `index.html` via `vercel.json`, so direct navigation to nested routes works in production.

## Testing

This repository uses Vitest for unit and integration testing in the web app workspace.

Run tests from the repository root:

- `npm run test` for watch mode.
- `npm run test:run` for a one-off full run.
- `npm run test:unit` for unit tests.
- `npm run test:integration` for integration tests.

The localization coverage test ensures every supported locale includes all translation keys defined in the default language.
