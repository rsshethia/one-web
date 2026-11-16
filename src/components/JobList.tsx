import { useMemo, useState } from 'react';
import { searchJobs } from '../lib/data';
import type { LgaRow } from '../lib/types';

export default function JobList({
  rows,
  state,
  selected,
  onSelect,
}: {
  rows: LgaRow[];
  state: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    let r = searchJobs(rows, q, state);
    if (selected) r = r.filter((j) => j.council_id === selected);
    return r.slice(0, 500);
  }, [rows, q, selected, state]);
  const councils = useMemo(
    () => rows.filter((r) => !r.state || r.state === state).map((r) => ({ id: r.council_id, name: r.council })),
    [rows, state],
  );
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search job titles… (e.g. planner, engineer)"
          style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <select
          value={selected || 'all'}
          onChange={(e) => onSelect(e.target.value === 'all' ? null : e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8 }}
        >
          <option value="all">All councils</option>
          {councils.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <p style={{ fontSize: 13, color: '#555' }}>{results.length} roles shown</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map((j, i) => (
          <li key={i} style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 8, marginBottom: 8 }}>
            <a href={j.job_url} target="_blank" rel="noopener" style={{ display: 'block', padding: '10px 12px', color: '#0b4ea2', textDecoration: 'none', fontSize: 14 }}>
              <div>{j.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{j.council}</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
