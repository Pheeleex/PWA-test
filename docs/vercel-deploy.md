# Vercel Deployment

This repo can be deployed to Vercel as a static PWA build from the repository root.

## What is already configured

- [vercel.json](/Users/nubiaville/Documents/Promolocation/vercel.json)
  - builds the PWA with `npm run pwa:build`
  - publishes `apps/pwa/dist`
  - rewrites `/api/*` to `https://promolocation.nubiaville.com/api/*`
  - rewrites SPA routes to `/index.html`
- [api-config.ts](/Users/nubiaville/Documents/Promolocation/packages/shared/src/api-config.ts)
  - supports `VITE_API_BASE_URL`
  - automatically uses `/api/` on `localhost` and `*.vercel.app`

## Recommended Vercel settings

Create the project from the repo root and let `vercel.json` drive the build.

- Root Directory: `.`
- Framework Preset: `Other` or `Vite`
- Install Command: from `vercel.json`
- Build Command: from `vercel.json`
- Output Directory: from `vercel.json`

## Environment variable

If you deploy on a custom domain, add this in Vercel Project Settings:

```bash
VITE_API_BASE_URL=/api/
```

That keeps browser requests same-origin so the Vercel rewrite can proxy them to the backend without CORS issues.

## Deploy flow

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the repo into Vercel.
3. If using a custom domain, add `VITE_API_BASE_URL=/api/` for:
   - Production
   - Preview
4. Trigger the first deployment.
5. After deploy, test:
   - login
   - map loads zones
   - QR unlock flow
   - install prompt
   - offline reload after one successful online visit

## Notes

- The service worker and manifest are already part of the PWA build.
- The local Vite dev proxy is still used for `npm run pwa:dev`.
- If a previous service worker is cached in your browser, do one hard refresh after the new deployment.
