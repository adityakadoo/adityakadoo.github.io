import katex from 'katex';
import type { Heading, RootContent } from 'mdast';
import { escapeHtml } from './html';

const WRAPPERS: Record<string, string> = {
  emphasis: 'em',
  strong: 'strong',
  delete: 'del',
  underline: 'u',
};

function renderMath(value: string, displayMode: boolean): string {
  try {
    // Keep the default MathML layer so the nav link's accessible name reads the
    // symbol rather than dropping it.
    return katex.renderToString(value, { displayMode, throwOnError: false });
  } catch {
    return escapeHtml(value);
  }
}

function renderChildren(nodes: RootContent[]): string {
  return nodes.map(render).join('');
}

function render(node: RootContent): string {
  switch (node.type) {
    case 'text':
      return escapeHtml(node.value);
    case 'inlineMath':
      return renderMath(node.value, false);
    case 'math':
      return renderMath(node.value, true);
    case 'inlineCode':
      return `<code>${escapeHtml(node.value)}</code>`;
    case 'break':
      return ' ';
    case 'link':
      return renderChildren(node.children as RootContent[]);
    default: {
      const tag = WRAPPERS[node.type];
      const inner = 'children' in node ? renderChildren(node.children as RootContent[]) : '';
      return tag ? `<${tag}>${inner}</${tag}>` : inner;
    }
  }
}

/**
 * Inline HTML for a heading, with math typeset the same way the article body is.
 * Astro derives `MarkdownHeading.text` from the rendered heading, so KaTeX's
 * MathML, TeX annotation, and HTML layers all collapse into one unreadable
 * string ("ϵ\epsilonϵ-greedy"). Table-of-contents labels use this instead.
 */
export function headingHtml(node: Heading): string {
  return renderChildren(node.children as RootContent[]).trim();
}
