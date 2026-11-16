import type { LgaRow } from './types';

export function searchJobs(rows: LgaRow[], q: string, state = 'Victoria') {
  const needle = q.trim().toLowerCase();
  const out: { council: string; council_id: string; title: string; job_url: string }[] = [];
  for (const r of rows) {
    if (r.state && r.state !== state) continue;
    for (const j of r.jobs) {
      if (!needle || j.title.toLowerCase().includes(needle)) {
        out.push({ council: r.council, council_id: r.council_id, title: j.title, job_url: j.job_url });
      }
    }
  }
  return out;
}
