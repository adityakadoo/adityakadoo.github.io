import { escapeHtml } from '../html';
import { asRecord, parseBlockBody } from '../parse-body';
import type { BlockAdapter, Visual } from '../types';
import { cardVisual } from '../visuals';

function jsonTree(value: unknown, depth = 0): string {
  if (value == null) return `<span class="json-leaf">null</span>`;
  if (typeof value !== 'object') {
    return `<span class="json-leaf">${escapeHtml(JSON.stringify(value))}</span>`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `<span class="json-leaf">[]</span>`;
    const items = value
      .map((item, i) => `<li><span class="json-key">${i}</span> ${jsonTree(item, depth + 1)}</li>`)
      .join('');
    return `<details ${depth < 1 ? 'open' : ''} class="json-tree"><summary>Array (${value.length})</summary><ul>${items}</ul></details>`;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return `<span class="json-leaf">{}</span>`;
  const items = entries
    .map(([k, v]) => `<li><span class="json-key">${escapeHtml(k)}</span> ${jsonTree(v, depth + 1)}</li>`)
    .join('');
  return `<details ${depth < 1 ? 'open' : ''} class="json-tree"><summary>Object (${entries.length})</summary><ul>${items}</ul></details>`;
}

function columnsOf(spec: Record<string, unknown>): string[] {
  if (Array.isArray(spec.columns)) return spec.columns.map(String);
  const rows = spec.rows;
  if (Array.isArray(rows) && rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return Object.keys(rows[0] as object);
  }
  return [];
}

function rowsOf(spec: Record<string, unknown>, columns: string[]): unknown[][] {
  const rows = spec.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    if (Array.isArray(row)) return row;
    const rec = asRecord(row);
    return columns.map((c) => rec[c]);
  });
}

function statsHtml(columns: string[], rows: unknown[][]): string {
  if (rows.length === 0) return '';
  const bits: string[] = [`<p class="dataset-stats">${rows.length} rows × ${columns.length} columns.`];
  for (let c = 0; c < columns.length; c++) {
    const nums = rows.map((r) => Number(r[c])).filter((n) => Number.isFinite(n));
    if (nums.length < 2) continue;
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    bits.push(`${escapeHtml(columns[c])} mean ${mean.toFixed(2)}`);
  }
  bits.push('</p>');
  return bits.join(' ');
}

function tableHtml(columns: string[], rows: unknown[][], id: string): string {
  const head = columns.map((c) => `<th><button type="button" data-sort="${escapeHtml(c)}">${escapeHtml(c)}</button></th>`).join('');
  const body = rows
    .slice(0, 200)
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell ?? ''))}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<div class="dataset-table-wrap" data-interactive-id="${escapeHtml(id)}">
    <table class="dataset-table">
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

function fallbackPoster(block: { poster?: string; caption?: string; name: string }): string {
  if (block.poster) {
    return `<img class="interactive-fallback" src="${escapeHtml(block.poster)}" alt="${escapeHtml(block.caption || block.name)}"/>`;
  }
  return `<p class="interactive-fallback">${escapeHtml(block.caption || 'Interactive figure — see the live page.')}</p>`;
}

export const interactiveAdapter: BlockAdapter = {
  name: 'interactive',
  category: 4,
  langs: ['interactive', 'dataset', 'json-tree'],
  parse(input) {
    const { props, json } = parseBlockBody(input.value);
    const spec = { ...asRecord(json), ...input.attributes, ...props };
    const kind =
      input.lang === 'dataset' || input.lang === 'json-tree'
        ? input.lang
        : String(spec.kind ?? 'json-tree');
    spec.kind = kind;
    const caption = String(spec.caption ?? input.attributes.caption ?? '');
    const poster = spec.poster ? String(spec.poster) : undefined;
    if (!caption) {
      spec.caption = `${kind} figure`;
    }
    return {
      props: spec,
      caption: caption || String(spec.caption),
      poster,
    };
  },
  html(block) {
    const kind = String(block.props.kind ?? 'json-tree');
    let live = '';
    if (kind === 'dataset') {
      const columns = columnsOf(block.props);
      const rows = rowsOf(block.props, columns);
      live = `${statsHtml(columns, rows)}${tableHtml(columns, rows, block.id)}`;
    } else {
      live = jsonTree(block.props.data ?? block.props.tree ?? {});
    }
    const inner = `<div class="interactive-live">${live}</div>${fallbackPoster(block)}`;
    return inner;
  },
  caption(block) {
    return block.caption || `${String(block.props.kind ?? 'interactive')} figure.`;
  },
  visual(block): Visual | null {
    if (block.poster) return { kind: 'image', content: block.poster };
    return cardVisual(interactiveAdapter.caption(block), { kicker: 'interactive' });
  },
  frames: () => null,
  fallback(block) {
    return `${interactiveAdapter.caption(block)} Interactive content is only on the live page.`;
  },
};
