import { escapeHtml } from '../html';
import { asRecord, parseBlockBody } from '../parse-body';
import type { BlockAdapter, Visual } from '../types';

interface MapPoint {
  name: string;
  lat: number;
  lon: number;
}

function pointsFrom(spec: Record<string, unknown>): MapPoint[] {
  const raw = spec.points;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      const rec = asRecord(p);
      const lat = Number(rec.lat);
      const lon = Number(rec.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return { name: String(rec.name ?? ''), lat, lon };
    })
    .filter((p): p is MapPoint => p !== null);
}

export function renderMapSvg(spec: Record<string, unknown>): string {
  const W = 720;
  const H = 400;
  const pad = 28;
  const pts = pointsFrom(spec);
  const project = (lat: number, lon: number) => {
    const x = pad + ((lon + 180) / 360) * (W - pad * 2);
    const y = pad + ((90 - lat) / 180) * (H - pad * 2);
    return { x, y };
  };

  const meridians = [-120, -60, 0, 60, 120].map((lon) => {
    const a = project(80, lon);
    const b = project(-80, lon);
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#d9d4c8" stroke-width="1"/>`;
  });
  const parallels = [-60, -30, 0, 30, 60].map((lat) => {
    const a = project(lat, -170);
    const b = project(lat, 170);
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#d9d4c8" stroke-width="1"/>`;
  });

  const markers = pts.map((p) => {
    const { x, y } = project(p.lat, p.lon);
    const label = p.name
      ? `<text x="${x + 8}" y="${y - 8}" font-size="12" font-family="Georgia, serif" fill="#111">${escapeHtml(p.name)}</text>`
      : '';
    return `<circle cx="${x}" cy="${y}" r="6" fill="#AA0000" stroke="#fff" stroke-width="2"/>${label}`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="map-svg">
    <rect width="${W}" height="${H}" fill="#eef3f7"/>
    <rect x="${pad}" y="${pad}" width="${W - pad * 2}" height="${H - pad * 2}" fill="#dce8de" stroke="#888" stroke-width="1"/>
    ${meridians.join('')}
    ${parallels.join('')}
    ${markers.join('')}
  </svg>`;
}

export const mapAdapter: BlockAdapter = {
  name: 'map',
  category: 2,
  langs: ['map'],
  parse(input) {
    const { props, json } = parseBlockBody(input.value);
    const spec = { ...asRecord(json), ...input.attributes, ...props };
    return {
      props: spec,
      caption: String(spec.caption ?? input.attributes.caption ?? ''),
    };
  },
  html(block) {
    return `<div class="svg-box map-box">${renderMapSvg(block.props)}</div>`;
  },
  caption(block) {
    if (block.caption) return block.caption;
    const n = Array.isArray(block.props.points) ? block.props.points.length : 0;
    return n ? `A map with ${n} locations.` : 'A map.';
  },
  visual(block): Visual {
    return { kind: 'svg', content: renderMapSvg(block.props), width: 720, height: 400 };
  },
  frames: () => null,
  fallback: (block) => mapAdapter.caption(block),
};
