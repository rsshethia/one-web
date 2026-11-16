# Council Jobs Web (split out from `one/` staging repo)

Astro + React. Static output — same build runs locally, on Render Static, and on GitHub Pages.

## Dev (local, no DB needed)

```bash
cd web
npm install
npm run sync    # copies ../etl/outputs/*.json -> src/data (fallback source)
npm run dev     # http://localhost:4321
```

Set `PUBLIC_MAPBOX_TOKEN` in `web/.env` to enable tiles (else list still works).

## Build / hosting

- `npm run build` → `dist/` — publish to GitHub Pages (`peaceiris/actions-gh-pages`) or Render Static (publish dir `dist/`).
- For project-page URLs set `base: '/<repo>/'` in `astro.config.mjs`.

## Data (Neon later, optional)

Today the build bakes `etl/outputs/lga_jobs.json`. When Neon is live:

1. `USE_NEON=1 DATABASE_URL=... npm run sync` (or wire the sync into CI after ETL upload),
2. rebuild — pages stay static, no server needed.

Live-query mode (SSR on Render Web Service) is a later switch: `output: 'server'` + Neon serverless driver. Not needed for v1.
