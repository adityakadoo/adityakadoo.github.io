import type { BlockAdapter } from '../types';

export const clipAdapter: BlockAdapter = {
  name: 'clip',
  category: 2,
  langs: ['clip'],
  keepChildren: true,
  parse(input) {
    return {
      props: { ...input.attributes, clip: true },
      caption: input.attributes.caption,
    };
  },
  html() {
    return '';
  },
  caption(block) {
    return block.caption || '';
  },
  visual: () => null,
  frames: () => null,
  fallback: () => null,
};
