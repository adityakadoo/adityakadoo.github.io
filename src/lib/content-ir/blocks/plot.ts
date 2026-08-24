import { escapeHtml } from '../html';
import { asRecord, parseBlockBody } from '../parse-body';
import type { BlockAdapter, Visual } from '../types';

function numbers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => Number(v)).filter((n) => Number.isFinite(n));
}

function labels(value: unknown, fallbackLen: number): string[] {
  if (Array.isArray(value) && value.length) return value.map((v) => String(v));
  return Array.from({ length: fallbackLen }, (_, i) => String(i + 1));
}

export function renderPlotSvg(spec: Record<string, unknown>): string {
  const type = String(spec.type ?? 'bar');
  const y = numbers(spec.y ?? spec.values);
  const x = labels(spec.x ?? spec.labels, y.length);
  const n = Math.min(x.length, y.length);
  const W = 720;
  const H = 400;
  const l = 64;
  const r = 24;
  const t = 28;
  const b = 56;
  const plotW = W - l - r;
  const plotH = H - t - b;
  const max = Math.max(...y.slice(0, n), 1e-6);
  const yLabel = String(spec.yLabel ?? '');

  const axis = `
    <rect x="0" y="0" width="${W}" height="${H}" fill="#fbfaf6"/>
    <line x1="${l}" y1="${t}" x2="${l}" y2="${t + plotH}" stroke="#222" stroke-width="1.5"/>
    <line x1="${l}" y1="${t + plotH}" x2="${l + plotW}" y2="${t + plotH}" stroke="#222" stroke-width="1.5"/>
    ${yLabel ? `<text x="18" y="${t + plotH / 2}" fill="#222" font-size="12" font-family="Georgia, serif" transform="rotate(-90 18 ${t + plotH / 2})">${escapeHtml(yLabel)}</text>` : ''}
  `;

  if (type === 'line' && n > 0) {
    const pts = y.slice(0, n).map((val, i) => {
      const px = l + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
      const py = t + plotH - (val / max) * plotH;
      return { px, py, label: x[i] };
    });
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="plot-svg">${axis}
      <path d="${d}" fill="none" stroke="#AA0000" stroke-width="2.5"/>
      ${pts.map((p) => `<circle cx="${p.px}" cy="${p.py}" r="4" fill="#AA0000"/>`).join('')}
      ${pts.map((p) => `<text x="${p.px}" y="${t + plotH + 22}" text-anchor="middle" font-size="12" font-family="Georgia, serif" fill="#222">${escapeHtml(p.label)}</text>`).join('')}
    </svg>`;
  }

  const gap = 8;
  const barW = n > 0 ? (plotW - gap * (n + 1)) / n : 0;
  const bars = y.slice(0, n).map((val, i) => {
    const h = (val / max) * plotH;
    const bx = l + gap + i * (barW + gap);
    const by = t + plotH - h;
    return `<rect x="${bx}" y="${by}" width="${barW}" height="${h}" fill="#AA0000"/>
      <text x="${bx + barW / 2}" y="${t + plotH + 22}" text-anchor="middle" font-size="12" font-family="Georgia, serif" fill="#222">${escapeHtml(x[i])}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="plot-svg">${axis}${bars.join('')}</svg>`;
}

export const plotAdapter: BlockAdapter = {
  name: 'plot',
  category: 2,
  langs: ['plot', 'graph'],
  parse(input) {
    const { props, json } = parseBlockBody(input.value);
    const spec = { ...asRecord(json), ...input.attributes, ...props };
    return {
      props: spec,
      caption: String(spec.caption ?? input.attributes.caption ?? ''),
    };
  },
  html(block) {
    return `<div class="svg-box plot-box">${renderPlotSvg(block.props)}</div>`;
  },
  caption(block) {
    if (block.caption) return block.caption;
    const type = String(block.props.type ?? 'bar');
    return `A ${type} chart.`;
  },
  visual(block): Visual {
    return { kind: 'svg', content: renderPlotSvg(block.props), width: 720, height: 400 };
  },
  frames: () => null,
  fallback: (block) => plotAdapter.caption(block),
};
