import { useEffect, useRef } from 'react';
import type { LgaRow } from '../lib/types';

declare const mapboxgl: any;

function waitForMapbox(timeoutMs: number): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).mapboxgl) return resolve((window as any).mapboxgl);
    const started = Date.now();
    const t = setInterval(() => {
      if ((window as any).mapboxgl) {
        clearInterval(t);
        resolve((window as any).mapboxgl);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(t);
        reject(new Error('Mapbox GL failed to load (CDN unreachable?)'));
      }
    }, 200);
  });
}

export default function Map({
  rows,
  selected,
  onPick,
}: {
  rows: LgaRow[];
  selected: string | null;
  onPick: (id: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    let cancelled = false;
    let map: any = null;
    const token = (import.meta as any).env.PUBLIC_MAPBOX_TOKEN || '';
    if (!token) {
      if (ref.current)
        ref.current.innerHTML =
          '<p style="padding:20px;color:#666">Set PUBLIC_MAPBOX_TOKEN in .env to enable the map. The job list still works.</p>';
      return;
    }
    waitForMapbox(10000)
      .then((mb) => {
        if (cancelled || !ref.current) return;
        mb.accessToken = token.trim();
        map = new mb.Map({
          container: ref.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [145.2, -37.4],
          zoom: 6,
        });
        mapRef.current = map;
        return Promise.all([
          fetch(`${(import.meta as any).env.BASE_URL}geo/vic_lga.geojson`).then((r) => {
            if (!r.ok) throw new Error('boundary file missing: ' + r.status);
            return r.json();
          }),
        ]).then(([geo]) => {
          if (cancelled) return;
          const byAbs: Record<string, number> = {};
          for (const r of rows) if (r.abs_name) byAbs[r.abs_name] = r.jobs_count;
          for (const f of geo.features) f.properties.jobs = byAbs[f.properties.LGA_NAME11] || 0;
          map.on('load', () => {
            map.addSource('lgas', { type: 'geojson', data: geo });
            map.addLayer({
              id: 'lgas-fill', type: 'fill', source: 'lgas',
              paint: {
                'fill-color': ['case', ['==', ['get', 'jobs'], 0], '#e5e5e5', ['<=', ['get', 'jobs'], 3], '#a7d7c5', ['<=', ['get', 'jobs'], 9], '#4fae8c', '#0b6e4f'],
                'fill-opacity': 0.65,
              },
            });
            map.addLayer({ id: 'lgas-line', type: 'line', source: 'lgas', paint: { 'line-color': '#fff', 'line-width': 1 } });
            map.addLayer({
              id: 'lgas-hl', type: 'line', source: 'lgas',
              paint: {
                'line-color': '#111',
                'line-width': 3.5,
                // dashed outline = non-colour cue: selection stays visible to
                // colour-blind users and over the darkest fill bucket
                'line-dasharray': [3, 1.5],
              },
              filter: ['==', ['get', 'LGA_NAME11'], ''],
            });
            map.on('click', 'lgas-fill', (e: any) => {
              const abs = e.features[0].properties.LGA_NAME11;
              const hit = rows.find((r) => r.abs_name === abs);
              map.setFilter('lgas-hl', ['==', ['get', 'LGA_NAME11'], abs]);
              onPickRef.current(hit ? hit.council_id : null);
            });
            map.on('click', (e: any) => {
              if (!map.queryRenderedFeatures(e.point, { layers: ['lgas-fill'] }).length) {
                map.setFilter('lgas-hl', ['==', ['get', 'LGA_NAME11'], '']);
                onPickRef.current(null);
              }
            });
            map.on('mouseenter', 'lgas-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'lgas-fill', () => { map.getCanvas().style.cursor = ''; });
          });
          map.on('error', (e: any) => {
            const status = e?.error?.status;
            if (status === 403 && ref.current) {
              ref.current.insertAdjacentHTML(
                'beforeend',
                '<p style="position:absolute;left:12px;bottom:64px;background:#fdecea;color:#8f1d1d;border:1px solid #f3c1c1;border-radius:8px;padding:10px 12px;font-size:13px;max-width:320px">Mapbox refused this token (403) — add this page\u2019s exact address to the token\u2019s URL restrictions.</p>',
              );
            }
          });
        });
      })
      .catch((err) => {
        console.error(err);
        if (ref.current && !cancelled)
          ref.current.innerHTML = `<p style="padding:20px;color:#666">Map failed to load: ${(err as Error).message}. The job list still works.</p>`;
      });
    return () => {
      cancelled = true;
      try { map && map.remove(); } catch { /* already gone */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // highlight the council selected from the list
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('lgas-hl')) return;
    const hit = rows.find((r) => r.council_id === selected);
    map.setFilter('lgas-hl', ['==', ['get', 'LGA_NAME11'], hit?.abs_name || '']);
  }, [selected, rows]);

  // legend buckets with live counts (same thresholds as the fill paint)
  const buckets = [
    { label: '0', color: '#e5e5e5', n: rows.filter((r) => r.jobs_count === 0).length },
    { label: '1–3', color: '#a7d7c5', n: rows.filter((r) => r.jobs_count >= 1 && r.jobs_count <= 3).length },
    { label: '4–9', color: '#4fae8c', n: rows.filter((r) => r.jobs_count >= 4 && r.jobs_count <= 9).length },
    { label: '10+', color: '#0b6e4f', n: rows.filter((r) => r.jobs_count >= 10).length },
  ];
  const councils = [...rows].sort((a, b) => a.council.localeCompare(b.council));

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 420, position: 'relative' }}>
      <div ref={ref} style={{ width: '100%', height: '100%', minHeight: 420 }} />
      {/* keyboard / screen-reader path: full council picker + reset, no canvas needed */}
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 8 }}>
        <label htmlFor="map-council-picker" style={{ position: 'absolute', left: -9999 }}>
          Choose a council
        </label>
        <select
          id="map-council-picker"
          value={selected || ''}
          onChange={(e) => onPickRef.current(e.target.value || null)}
          style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', fontSize: 14 }}
        >
          <option value="">Choose a council…</option>
          {councils.map((c) => (
            <option key={c.council_id} value={c.council_id}>
              {c.council} ({c.jobs_count})
            </option>
          ))}
        </select>
        <button
          onClick={() => onPickRef.current(null)}
          disabled={!selected}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ccc', background: selected ? '#fff' : '#f0f0f0', cursor: selected ? 'pointer' : 'default', fontSize: 14 }}
        >
          Reset
        </button>
      </div>
      {/* on-map legend with thresholds + live counts */}
      <div style={{ position: 'absolute', left: 12, bottom: 28, background: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#333', boxShadow: '0 1px 4px rgba(0,0,0,.25)' }}>
        <strong>Open roles</strong>
        {buckets.map((b) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, display: 'inline-block', background: b.color, border: b.label === '0' ? '1px solid #bbb' : 'none' }} />
            {b.label} · {b.n}
          </div>
        ))}
      </div>
    </div>
  );
}
