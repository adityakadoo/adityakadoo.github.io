import { knownDiagramTypes, renderDiagram } from '../../diagrams/registry';
import { escapeHtml } from '../html';
import { parseBlockBody } from '../parse-body';
import type { BlockAdapter } from '../types';

function diagramType(lang: string, props: Record<string, string>, attributes: Record<string, string>): string {
  if (lang.startsWith('svg-')) return lang.slice(4);
  return attributes.type || props.type || 'football-field';
}

export const diagramAdapter: BlockAdapter = {
  name: 'diagram',
  category: 2,
  langs: ['diagram', 'svg-football-field'],
  parse(input) {
    const { props } = parseBlockBody(input.value);
    const merged = { ...props, ...input.attributes };
    const type = diagramType(input.lang, props, input.attributes);
    return {
      props: { ...merged, type },
      caption: merged.caption,
    };
  },
  html(block) {
    const type = String(block.props.type ?? 'football-field');
    const svg = renderDiagram(type, stringProps(block.props));
    return svg
      ? `<div class="svg-box" data-diagram="${escapeHtml(type)}">${svg}</div>`
      : `<div class="svg-box svg-box-error" role="alert"><p>Unknown diagram type <code>${escapeHtml(type)}</code>. Known types: ${knownDiagramTypes().map((t) => `<code>${escapeHtml(t)}</code>`).join(', ')}.</p></div>`;
  },
  caption(block) {
    if (block.caption) return block.caption;
    const type = String(block.props.type ?? 'diagram').replaceAll('-', ' ');
    const home = block.props.home ? String(block.props.home) : '';
    const away = block.props.away ? String(block.props.away) : '';
    if (home && away) return `A ${type} diagram of ${home} versus ${away}.`;
    return `A ${type} diagram.`;
  },
  visual(block) {
    const type = String(block.props.type ?? 'football-field');
    const svg = renderDiagram(type, stringProps(block.props));
    if (!svg) return null;
    return { kind: 'svg', content: svg, width: 800, height: 520 };
  },
  frames: () => null,
  fallback: (block) => diagramAdapter.caption(block),
};

function stringProps(props: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v == null || typeof v === 'object') continue;
    out[k] = String(v);
  }
  return out;
}
