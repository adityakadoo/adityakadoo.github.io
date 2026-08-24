import type { Parent, Root, RootContent } from 'mdast';

/**
 * Authoring rules (one blank line = new sibling block)
 *
 * Two newline characters (`\n\n`) start a new top-level sibling. A single
 * newline continues the current block.
 *
 * - Paragraph: wrapped inline text. One newline is a soft break in the same `<p>`.
 * - List / definition / quote / fenced code / display math: if they start on
 *   the next line with **no** blank line, they belong to the parent (list item,
 *   `<dd>`, or quote). A blank line makes them a sibling.
 * - Definitions: term on its own line, `: ` body on the next line. A leading
 *   `- ` is allowed when the definition is a list item.
 * - Display math: opening `$$` on its own line, body, closing `$$` on its own
 *   line. Never put TeX on the `$$` opener; never end the opener with `\\`.
 * - Macros: `\dots` not `\dot\dot\dot`; keep `\\\{` only where `{` would be
 *   eaten by markdown.
 *
 * remark-deflist and remark-math often leave a tight-following list, quote,
 * code, or `math` node as a sibling of the list / definition list. This plugin
 * re-parents those nodes into the preceding `listItem` or `descriptiondetails`.
 */

const ITEM_TYPES = new Set(['listItem', 'descriptiondetails']);
const GROUP_TYPES = new Set(['list', 'descriptionlist']);
const ATTACHABLE = new Set(['math', 'list', 'blockquote', 'code', 'paragraph']);
const NEVER_ATTACH = new Set([
  'heading',
  'thematicBreak',
  'listItem',
  'descriptionterm',
  'descriptiondetails',
  'descriptionlist',
]);

/** Blocks already pulled into `prev` extend how far "tight" reaches. */
function lastLine(node: RootContent): number | undefined {
  let end = node.position?.end?.line;
  if ('children' in node && Array.isArray((node as Parent).children)) {
    for (const child of (node as Parent).children as RootContent[]) {
      const childEnd = lastLine(child);
      if (childEnd != null && (end == null || childEnd > end)) end = childEnd;
    }
  }
  return end;
}

function isTight(prev: RootContent, next: RootContent): boolean {
  const pe = lastLine(prev);
  const ns = next.position?.start?.line;
  if (pe == null || ns == null) return next.type !== 'paragraph';
  return ns <= pe + 1;
}

function canAttach(next: RootContent): boolean {
  return ATTACHABLE.has(next.type) && !NEVER_ATTACH.has(next.type);
}

function isParent(node: RootContent): node is RootContent & Parent {
  return 'children' in node && Array.isArray((node as Parent).children);
}

function lastItem(node: Parent): Parent | undefined {
  if (node.type === 'blockquote') return node;
  const kids = node.children as Parent[];
  for (let i = kids.length - 1; i >= 0; i--) {
    if (ITEM_TYPES.has(kids[i].type)) return kids[i];
  }
  return undefined;
}

function attachTarget(node: RootContent): Parent | undefined {
  if (!isParent(node)) return undefined;
  if (ITEM_TYPES.has(node.type) || node.type === 'blockquote') return node;
  if (GROUP_TYPES.has(node.type)) return lastItem(node);
  return undefined;
}

type ListNode = RootContent & Parent & { type: 'list'; ordered?: boolean | null; spread?: boolean | null };

function wrapOrphanListItems(parent: Parent): void {
  const children = parent.children as RootContent[];
  for (const child of children) {
    if (isParent(child)) wrapOrphanListItems(child);
  }
  if (parent.type === 'list') return;

  const out: RootContent[] = [];
  let pending: RootContent[] = [];

  const flush = () => {
    if (!pending.length) return;
    const items: RootContent[] = [];
    let ordered: boolean | null | undefined;
    let spread: boolean | null | undefined;
    for (const node of pending) {
      if (node.type === 'listItem') {
        items.push(node);
      } else if (node.type === 'list') {
        const list = node as ListNode;
        ordered = list.ordered;
        spread = list.spread;
        items.push(...list.children);
      }
    }
    out.push({
      type: 'list',
      ordered: ordered ?? false,
      spread: spread ?? false,
      children: items,
    } as ListNode);
    pending = [];
  };

  for (const child of children) {
    if (child.type === 'listItem' || (child.type === 'list' && pending.length > 0)) {
      pending.push(child);
      continue;
    }
    flush();
    out.push(child);
  }
  flush();
  parent.children = out as typeof parent.children;
}

export function remarkAttachTightBlocks() {
  return (tree: Root) => {
    const walk = (parent: Parent) => {
      const children = parent.children as RootContent[];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (isParent(node)) walk(node);

        const target = attachTarget(node);
        if (!target) continue;

        while (i + 1 < children.length) {
          const next = children[i + 1];
          if (!canAttach(next) || !isTight(node, next)) break;
          children.splice(i + 1, 1);
          target.children.push(next);
          if (isParent(next)) walk(next);
        }
      }
    };

    walk(tree);
    wrapOrphanListItems(tree);
  };
}
