# Deployment

This repository is configured for Vercel deployment from the repo root.

## First-time setup in Vercel

1. Import this repository in Vercel.
2. Keep the project Root Directory as the repository root.
3. Confirm the detected settings from `vercel.json`:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## SPA routing

Client-side routes are rewritten to `index.html` via `vercel.json`, so direct navigation to nested routes works in production.
