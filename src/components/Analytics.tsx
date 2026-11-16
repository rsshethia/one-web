import { useMemo } from 'react';
import type { LgaRow } from '../lib/types';

const STOP = new Set([
  'and', 'the', 'for', 'with', 'our', 'your', 'from', 'into', 'onto', 'per',
  'via', 'role', 'roles', 'join', 'team', 'apply', 'now', 'new', 'all',
  'are', 'expression', 'expressions', 'interest',
]);

function keywords(rows: LgaRow[], state: string) {
  const freq = new Map<string, number>();
  for (const r of rows) {
    if (r.state && r.state !== state) continue;
    for (const j of r.jobs) {
      for (const w of j.title.toLowerCase().split(/[^a-z]+/)) {
        if (w.length >= 4 && !STOP.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
      }
    }
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
}

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e2e2', borderRadius: 12, padding: 16,
};

export default function Analytics({ rows, state }: { rows: LgaRow[]; state: string }) {
  const s = useMemo(() => {
    const inState = rows.filter((r) => !r.state || r.state === state);
    const total = inState.reduce((a, r) => a + r.jobs.length, 0);
    const withJobs = inState.filter((r) => r.jobs.length > 0).length;
    const zero = inState.filter((r) => r.job_status === 'zero-roles').length;
    const review = inState.filter((r) => r.job_status === 'needs-review').length;
    const buckets = [
      { label: '0 roles', n: inState.filter((r) => r.jobs_count === 0).length, color: '#e5e5e5' },
      { label: '1–3', n: inState.filter((r) => r.jobs_count >= 1 && r.jobs_count <= 3).length, color: '#a7d7c5' },
      { label: '4–9', n: inState.filter((r) => r.jobs_count >= 4 && r.jobs_count <= 9).length, color: '#4fae8c' },
      { label: '10+', n: inState.filter((r) => r.jobs_count >= 10).length, color: '#0b6e4f' },
    ];
    const top = [...inState].sort((a, b) => b.jobs_count - a.jobs_count).slice(0, 10);
    const maxTop = Math.max(1, ...top.map((r) => r.jobs_count));
    const words = keywords(rows, state);
    const maxWord = Math.max(1, ...words.map(([, n]) => n));
    const fresh = inState.map((r) => r.scraped_at || '').filter(Boolean).sort().pop() || '—';
    return { inState, total, withJobs, zero, review, buckets, top, maxTop, words, maxWord, fresh };
  }, [rows, state]);

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Analytics</h2>
      <p style={{ color: '#555', marginBottom: 16, fontSize: 13 }}>
        Snapshot {s.fresh} · {s.inState.length} councils · counts only — titles link out to official portals.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { v: String(s.total), l: 'open roles' },
          { v: String(s.inState.length), l: 'councils tracked' },
          { v: String(s.withJobs), l: 'councils hiring' },
          { v: String(s.zero), l: 'empty boards' },
        ].map((k, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{k.v}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{k.l}</div>
          </div>
        ))}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Councils by open-role band</div>
          {s.buckets.map((b) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
              <span style={{ width: 52, color: '#555' }}>{b.label}</span>
              <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 14 }}>
                <div style={{ width: `${(b.n / Math.max(1, s.inState.length)) * 100}%`, background: b.color, height: '100%', borderRadius: 4 }} />
              </div>
              <span style={{ width: 28, textAlign: 'right', fontWeight: 600 }}>{b.n}</span>
            </div>
          ))}
        </div>
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Most common title words</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {s.words.map(([w, n]) => (
              <span key={w} title={`${n} mentions`} style={{ background: '#eef4f1', border: '1px solid #d5e5dc', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                {w} <b>{n}</b>
              </span>
            ))}
          </div>
        </div>
        <div style={{ ...card, gridColumn: 'span 4' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Top hiring councils</div>
          {s.top.map((r) => (
            <div key={r.council_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
              <span style={{ width: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.council}</span>
              <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 14 }}>
                <div style={{ width: `${(r.jobs_count / s.maxTop) * 100}%`, background: '#0b6e4f', height: '100%', borderRadius: 4 }} />
              </div>
              <span style={{ width: 28, textAlign: 'right', fontWeight: 600 }}>{r.jobs_count}</span>
            </div>
          ))}
          {s.review > 0 && (
            <p style={{ fontSize: 12, color: '#8a6d00', marginTop: 8 }}>
              {s.review} board{s.review === 1 ? ' is' : 's are'} still under review (blocked or unparseable) — excluded from hiring counts until verified.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
