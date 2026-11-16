# Council Jobs Web (standalone repo — split from staging via `git subtree split -P web`)

Astro + React. Static output — same build runs locally, on Render Static, and on GitHub Pages.

## Dev (local, no DB needed)

```bash
npm install
npm run dev     # http://localhost:4321, serves committed src/data snapshot
```

Set `PUBLIC_MAPBOX_TOKEN` in `.env` to enable tiles (else list still works).

## Build / hosting

- `npm run build` → `dist/` — publish to GitHub Pages (`peaceiris/actions-gh-pages`) or Render Static (publish dir `dist/`, build command `npm ci && npm run build`).
- For project-page URLs set `base: '/<repo>/'` in `astro.config.mjs`.

## Data

`src/data/*.json` is a committed snapshot (VIC, 79 councils / 493 jobs at split time).
Refresh after an ETL run: copy fresh `jobs.json`, `councils.json`, `lga_jobs.json`
into `src/data/` (and `lga_jobs.json` into `public/data/`), commit, redeploy.
`npm run sync` does this automatically when checked out next to the ETL repo.

Upgrade path: pull from Neon at build time (`DATABASE_URL` in CI env + a small
`@neondatabase/serverless` fetch in `scripts/sync-data.mjs`), then rebuild.
Live-query mode (SSR on Render Web Service) is a later switch: `output: 'server'`. Not needed for v1.
