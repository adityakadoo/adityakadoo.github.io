import { escapeHtml } from '../html';
import type { BlockAdapter } from '../types';
import { cardVisual } from '../visuals';

const KINDS = new Set(['note', 'warning', 'tip', 'callout']);

export const calloutAdapter: BlockAdapter = {
  name: 'callout',
  category: 2,
  langs: ['callout', 'note', 'warning', 'tip'],
  keepChildren: true,
  parse(input) {
    const kind =
      input.lang === 'callout'
        ? input.attributes.kind || 'note'
        : KINDS.has(input.lang)
          ? input.lang
          : 'note';
    return {
      props: { ...input.attributes, kind },
      caption: input.attributes.caption,
    };
  },
  html(block) {
    const kind = String(block.props.kind ?? 'note');
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);
    return `<p class="callout-label">${escapeHtml(label)}</p>`;
  },
  caption(block) {
    if (block.caption) return block.caption;
    const kind = String(block.props.kind ?? 'note');
    return `${kind} callout.`;
  },
  visual(block) {
    const kind = String(block.props.kind ?? 'note');
    const text = block.caption || `${kind} callout.`;
    return cardVisual(text, { kicker: kind });
  },
  frames: () => null,
  fallback: (block) => calloutAdapter.caption(block),
};
