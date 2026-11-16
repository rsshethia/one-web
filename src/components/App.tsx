import { useState } from 'react';
import Map from './Map';
import JobList from './JobList';
import Analytics from './Analytics';
import About, { GITHUB_URL } from './About';
import type { LgaRow } from '../lib/types';

type View = 'map' | 'list' | 'analytics' | 'about';

const TABS: { id: View; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'list', label: 'List' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'about', label: 'About' },
];

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px', minHeight: 44, borderRadius: 8, border: '1px solid transparent',
  background: active ? '#0b6e4f' : 'transparent', color: active ? '#fff' : '#333',
  cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
});

export default function App({ rows, state }: { rows: LgaRow[]; state: string }) {
  const [view, setView] = useState<View>('map');
  const [selected, setSelected] = useState<string | null>(null);
  const total = rows.reduce((s, r) => s + r.jobs_count, 0);
  const sel = rows.find((r) => r.council_id === selected) || null;

  return (
    <div className="app-shell">
      <nav className="topnav">
        <strong className="brand">{state} council jobs</strong>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)} style={tabStyle(view === t.id)}>
            {t.label}
          </button>
        ))}
        <span style={{ flex: 'none' }} />
        <span className="role-count">{total} roles</span>
        <a href={GITHUB_URL} target="_blank" rel="noopener" className="gh-link">
          GitHub ↗
        </a>
      </nav>

      <div style={{ flex: 1, overflow: view === 'map' ? 'hidden' : 'auto' }}>
        {view === 'map' && (
          <div className="map-layout">
            <div className="map-pane">
              <Map rows={rows} selected={selected} onPick={setSelected} />
            </div>
            <div className="detail-pane">
              {!sel ? (
                <p style={{ color: '#777', fontSize: 15, padding: '40px 10px', textAlign: 'center' }}>
                  Click a shaded council area to see its open roles here — click water to reset.
                </p>
              ) : (
                <>
                  <h2 style={{ fontSize: 20 }}>{sel.council}</h2>
                  <p style={{ color: '#666', fontSize: 13, margin: '4px 0 8px' }}>
                    {(sel.job_status === 'ok' ? 'Vacancies listed' : sel.job_status) + ' · updated ' + (sel.scraped_at || '—')}
                  </p>
                  <p style={{ marginBottom: 12 }}>
                    <span style={{ background: '#0b6e4f', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 13 }}>
                      {sel.jobs_count}{sel.jobs_count === 1 ? ' role' : ' roles'}
                    </span>{' '}
                    <button onClick={() => setView('list')} style={{ fontSize: 13, color: '#0b4ea2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      open in List
                    </button>
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {sel.jobs.map((j, i) => (
                      <li key={i} style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 8, marginBottom: 8 }}>
                        <a href={j.job_url} target="_blank" rel="noopener" style={{ display: 'block', padding: '10px 12px', color: '#0b4ea2', textDecoration: 'none', fontSize: 14 }}>
                          {j.title}
                        </a>
                      </li>
                    ))}
                    {!sel.jobs.length && <li style={{ color: '#666', fontSize: 14 }}>No open roles listed.</li>}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
        {view === 'list' && (
          <div className="page-wrap narrow">
            <h2 style={{ marginBottom: 4 }}>All open roles</h2>
            <p style={{ color: '#555', marginBottom: 12, fontSize: 13 }}>
              {rows.length} councils · snapshot {rows.map((r) => r.scraped_at || '').filter(Boolean).sort().pop() || '—'} · links open the official council portal in a new tab.
            </p>
            <JobList rows={rows} state={state} selected={selected} onSelect={setSelected} />
          </div>
        )}
        {view === 'analytics' && (
          <div className="page-wrap wide">
            <Analytics rows={rows} state={state} />
          </div>
        )}
        {view === 'about' && (
          <div className="page-wrap narrow">
            <About />
          </div>
        )}
      </div>
    </div>
  );
}
