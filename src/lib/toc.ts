import type { MarkdownHeading } from 'astro';

export interface TocNode {
  heading: MarkdownHeading;
  children: TocNode[];
}

export function buildTocTree(
  headings: MarkdownHeading[],
  minDepth = 2,
  maxDepth = 4,
): TocNode[] {
  const filtered = headings.filter(
    (heading) => heading.depth >= minDepth && heading.depth <= maxDepth,
  );
  if (filtered.length === 0) return [];

  const root: TocNode[] = [];
  const stack: { depth: number; children: TocNode[] }[] = [
    { depth: minDepth - 1, children: root },
  ];

  for (const heading of filtered) {
    while (stack.length > 1 && stack[stack.length - 1].depth >= heading.depth) {
      stack.pop();
    }

    const node: TocNode = { heading, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push({ depth: heading.depth, children: node.children });
  }

  return root;
}
