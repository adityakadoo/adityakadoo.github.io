import type { Root } from 'mdast';
import { findAndReplace } from 'mdast-util-find-and-replace';

export function remarkUnderline() {
  return (tree: Root) => {
    findAndReplace(tree, [
      [
        /\+\+([^+]+)\+\+/g,
        (_: string, text: string) => ({
          type: 'underline',
          data: { hName: 'u' },
          children: [{ type: 'text', value: text }],
        }),
      ],
    ]);
  };
}
