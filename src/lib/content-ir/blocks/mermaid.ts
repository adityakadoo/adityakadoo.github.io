import { escapeHtml } from '../html';
import { cardVisual } from '../visuals';
import type { BlockAdapter, Visual } from '../types';

export const mermaidAdapter: BlockAdapter = {
  name: 'mermaid',
  category: 2,
  langs: ['mermaid'],
  parse(input) {
    return {
      props: { source: input.value.trim(), ...input.attributes },
      caption: input.attributes.caption,
    };
  },
  html(block) {
    const source = String(block.props.source ?? '');
    return `<pre class="mermaid">${escapeHtml(source)}</pre>`;
  },
  caption(block) {
    return block.caption || 'A mermaid diagram.';
  },
  visual(block): Visual {
    const source = String(block.props.source ?? '').slice(0, 400);
    return cardVisual(source || 'Mermaid diagram', { kicker: 'mermaid' });
  },
  frames: () => null,
  fallback: (block) => mermaidAdapter.caption(block),
};
