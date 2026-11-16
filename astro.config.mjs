import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Static output: works on GitHub Pages AND Render Static out of the box.
// Local: npm run dev. No server needed — data is baked at build time
// (from Neon if DATABASE_URL set, else from ../etl/outputs via sync script).
// Later: switch to output:'server' + adapter for live Neon queries.
export default defineConfig({
  output: 'static',
  integrations: [react()],
  // If deploying to GitHub Pages project site, set base: '/<repo>/'
  // base: '/',
});
