import type { Code, Root, RootContent } from 'mdast';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mathFromMarkdown } from 'mdast-util-math';
import { gfm } from 'micromark-extension-gfm';
import { math } from 'micromark-extension-math';
import { visit } from 'unist-util-visit';

/**
 * `$$tex` at the start of a line is a math *fence* (info string = the TeX).
 * Closing `$$` must then be on its own line, so `$$eq\\` … `eq$$` swallows
 * the rest of the note. Rebuild the equation and re-parse leftover markdown.
 *
 * Indented `    $$` is also parsed as a code block; convert TeX-looking code
 * back into math, and split math nodes that clearly contain markdown.
 */
function parseFragment(markdown: string): RootContent[] {
  const tree = fromMarkdown(markdown, {
    extensions: [gfm(), math()],
    mdastExtensions: [gfmFromMarkdown(), mathFromMarkdown()],
  });
  return tree.children as RootContent[];
}

function looksLikeTeX(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /^(import |const |function |class |[{["])/.test(trimmed)) return false;
  return /\\[a-zA-Z]+/.test(trimmed) && /[_^]|\\\\/.test(trimmed);
}

function markdownLeakAt(value: string): number {
  const match = value.match(/\n(?:#{1,6} |\*{2}[^*]|\d+\. |> |Examples of |[A-Z][a-z]+ (?:of|rule):)/);
  return match?.index ?? -1;
}

function toMath(value: string): RootContent {
  const tex = value.replace(/^\s*\$\$\s*/, '').replace(/\s*\$\$\s*$/, '').trim();
  return {
    type: 'math',
    value: tex,
    data: {
      hName: 'div',
      hProperties: { className: ['math', 'math-display'] },
    },
  } as RootContent;
}

export function remarkRepairMathFences() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (index == null || !parent) return;

      if (node.type === 'code') {
        const code = node as Code;
        if (code.lang || !looksLikeTeX(code.value)) return;
        parent.children[index] = toMath(code.value);
        return index;
      }

      if (node.type !== 'math') return;

      const mathNode = node as { type: 'math'; meta?: string | null; value?: string };
      const meta = typeof mathNode.meta === 'string' ? mathNode.meta : '';
      let value = mathNode.value ?? '';

      if (meta.trim()) {
        const combined = `${meta}\n${value}`;
        const cut = combined.indexOf('$$');
        value = (cut === -1 ? combined : combined.slice(0, cut)).replace(/\s+$/, '');
        const rest = cut === -1 ? '' : combined.slice(cut + 2).replace(/^\n/, '');
        mathNode.meta = null;
        mathNode.value = value.trim();
        if (rest.trim()) {
          parent.children.splice(index + 1, 0, ...parseFragment(rest));
          return index + 1;
        }
      }

      const leak = markdownLeakAt(mathNode.value ?? '');
      if (leak === -1) return;

      const tex = (mathNode.value ?? '').slice(0, leak).trim();
      const rest = (mathNode.value ?? '').slice(leak).replace(/^\n/, '');
      const extra = rest.trim() ? parseFragment(rest) : [];

      if (tex) {
        mathNode.value = tex;
        if (extra.length) parent.children.splice(index + 1, 0, ...extra);
        return extra.length ? index + 1 : undefined;
      }

      parent.children.splice(index, 1, ...extra);
      return extra.length ? index : undefined;
    });
  };
}
