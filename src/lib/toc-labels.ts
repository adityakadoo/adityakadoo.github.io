import type { MarkdownHeading } from 'astro';
import { buildNoteIr, findNote } from './content-ir/notes';
import type { TocHeading } from './toc';

/**
 * Astro builds `MarkdownHeading.text` from the rendered heading, so a heading
 * containing math arrives with KaTeX's MathML, TeX annotation, and HTML layers
 * concatenated. Pair each heading with the typeset label from the IR, which is
 * derived from the markdown AST instead.
 */
export function withMathLabels(
  collection: string,
  id: string,
  headings: MarkdownHeading[],
): TocHeading[] {
  if (headings.length === 0) return headings;
  const source = findNote(`${collection}/${id}`);
  if (!source) return headings;

  const labels = buildNoteIr(source).headings;
  if (labels.length !== headings.length) return headings;

  return headings.map((heading, index) => {
    const label = labels[index];
    if (label.depth !== heading.depth || !label.html) return heading;
    return { ...heading, html: label.html };
  });
}
