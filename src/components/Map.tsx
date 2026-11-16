import { useEffect, useRef } from 'react';
import type { LgaRow } from '../lib/types';

// Mapbox choropleth island. Port of map/app.js. Token via PUBLIC_MAPBOX_TOKEN.
declare const mapboxgl: any;

function colorFor(n: number) {
  if (n <= 0) return '#e5e5e5';
  if (n <= 3) return '#a7d7c5';
  if (n <= 9) return '#4fae8c';
  return '#0b6e4f';
}

export default function Map({ rows, onPick }: { rows: LgaRow[]; onPick: (id: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !(window as any).mapboxgl) return;
    const token = (import.meta as any).env.PUBLIC_MAPBOX_TOKEN || '';
    if (!token) {
      ref.current.innerHTML = '<p style="padding:20px;color:#666">Set PUBLIC_MAPBOX_TOKEN in web/.env to enable the map.</p>';
      return;
    }
    (window as any).mapboxgl.accessToken = token.trim();
    const map = new (window as any).mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [145.2, -37.4],
      zoom: 6,
    });
    let cancelled = false;
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}geo/vic_lga.geojson`).then((r) => r.json()),
    ]).then(([geo]) => {
      if (cancelled) return;
      const byAbs: Record<string, number> = {};
      for (const r of rows) if (r.abs_name) byAbs[r.abs_name] = r.jobs_count;
      for (const f of geo.features) f.properties.jobs = byAbs[f.properties.LGA_NAME11] || 0;
      map.on('load', () => {
        map.addSource('lgas', { type: 'geojson', data: geo });
        map.addLayer({ id: 'lgas-fill', type: 'fill', source: 'lgas',
          paint: { 'fill-color': ['case', ['==', ['get', 'jobs'], 0], '#e5e5e5', ['<=', ['get', 'jobs'], 3], '#a7d7c5', ['<=', ['get', 'jobs'], 9], '#4fae8c', '#0b6e4f'], 'fill-opacity': 0.65 } });
        map.addLayer({ id: 'lgas-line', type: 'line', source: 'lgas', paint: { 'line-color': '#fff', 'line-width': 1 } });
        map.on('click', 'lgas-fill', (e: any) => {
          const abs = e.features[0].properties.LGA_NAME11;
          const hit = rows.find((r) => r.abs_name === abs);
          onPick(hit ? hit.council_id : null);
        });
        map.on('click', (e: any) => {
          if (!map.queryRenderedFeatures(e.point, { layers: ['lgas-fill'] }).length) onPick(null);
        });
      });
    });
    return () => { cancelled = true; map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100%', minHeight: 420 }} />;
}
