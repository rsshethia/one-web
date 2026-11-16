// Sync data into web/ before build.
// Priority: ../etl/outputs/*.json fallback (Neon live pull comes later via USE_NEON).
// Writes src/data/*.json (baked import) + public/data/lga_jobs.json.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = dirname(here);
const repo = dirname(web);
const etlOut = join(repo, 'etl', 'outputs');
const srcData = join(web, 'src', 'data');
const pubData = join(web, 'public', 'data');

mkdirSync(srcData, { recursive: true });
mkdirSync(pubData, { recursive: true });

for (const name of ['jobs.json', 'councils.json', 'lga_jobs.json']) {
  const src = join(etlOut, name);
  if (existsSync(src)) {
    copyFileSync(src, join(srcData, name));
    if (name === 'lga_jobs.json') copyFileSync(src, join(pubData, name));
    console.log('copied', name);
  } else {
    console.log('missing in etl/outputs:', name, '(skipped)');
  }
}
console.log('sync done, source = etl/outputs fallback');
