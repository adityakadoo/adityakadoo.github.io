import type { Root, RootContent } from 'mdast';
import { visit, SKIP } from 'unist-util-visit';
import { registerAllBlocks } from '../lib/content-ir/blocks';
import { adapterForLang, getBlock } from '../lib/content-ir/registry';
import { parseMeta } from '../lib/content-ir/parse-body';
import type { ContentBlockData } from '../lib/content-ir/types';

registerAllBlocks();

function nextId(name: string, counter: { n: number }): string {
  counter.n += 1;
  return `${name}-${counter.n}`;
}

function directiveAttrs(node: { attributes?: Record<string, string | null | undefined> | null }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(node.attributes ?? {})) {
    if (v == null) continue;
    out[k] = String(v);
  }
  return out;
}

function wrapperTag(name: string): string {
  if (name === 'callout') return 'aside';
  if (name === 'clip') return 'div';
  return 'figure';
}

function escapeAttr(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toContentBlock(
  data: ContentBlockData,
  extraClass: string,
  children: RootContent[],
): RootContent {
  const className = ['content-block', `block-${data.name}`, extraClass].filter(Boolean);
  if (data.caption && wrapperTag(data.name) === 'figure') {
    children.push({
      type: 'html',
      value: `<figcaption class="block-caption">${escapeAttr(data.caption)}</figcaption>`,
    });
  }
  return {
    type: 'contentBlock',
    data: {
      block: data,
      hName: wrapperTag(data.name),
      hProperties: {
        className,
        dataBlock: data.name,
        dataBlockId: data.id,
        dataCategory: data.category,
        ...(data.caption ? { dataCaption: data.caption } : {}),
        ...(data.poster ? { dataPoster: data.poster } : {}),
      },
    },
    children,
  } as RootContent;
}

function makeBlock(
  adapter: NonNullable<ReturnType<typeof adapterForLang>>,
  input: Parameters<NonNullable<ReturnType<typeof adapterForLang>>['parse']>[0],
  counter: { n: number },
  extraClass: string,
  keep: RootContent[] | undefined,
): RootContent {
  const parsed = adapter.parse(input);
  const block: ContentBlockData = {
    id: nextId(adapter.name, counter),
    name: adapter.name,
    category: adapter.category,
    props: parsed.props,
    caption: parsed.caption || input.attributes.caption,
    poster: parsed.poster,
  };
  const prefixHtml = adapter.html(block);
  const children: RootContent[] = [];
  if (adapter.keepChildren) {
    if (prefixHtml) children.push({ type: 'html', value: prefixHtml });
    if (keep) children.push(...keep);
  } else if (prefixHtml) {
    children.push({ type: 'html', value: prefixHtml });
  }
  return toContentBlock(block, extraClass, children);
}

export function remarkContentBlocks() {
  return (tree: Root) => {
    const counter = { n: 0 };

    visit(tree, 'code', (node, index, parent) => {
      if (index === undefined || !parent) return;
      const lang = node.lang?.trim();
      if (!lang) return;
      const adapter = adapterForLang(lang);
      if (!adapter) return;
      const meta = parseMeta(node.meta ?? undefined);
      parent.children[index] = makeBlock(
        adapter,
        { lang, meta: node.meta ?? undefined, value: node.value ?? '', attributes: meta },
        counter,
        '',
        undefined,
      );
      return SKIP;
    });

    visit(tree, (node, index, parent) => {
      if (index === undefined || !parent) return;
      if (node.type !== 'containerDirective' && node.type !== 'leafDirective') return;
      const name = (node as { name?: string }).name;
      if (!name) return;
      const adapter = adapterForLang(name) ?? getBlock(name);
      if (!adapter) return;
      const attributes = directiveAttrs(node as { attributes?: Record<string, string | null | undefined> | null });
      const extra =
        adapter.name === 'callout'
          ? `callout-${attributes.kind || (name === 'callout' ? 'note' : name)}`
          : adapter.name === 'clip'
            ? 'content-clip'
            : '';
      const keep =
        adapter.keepChildren && 'children' in node
          ? ([...(node as { children: RootContent[] }).children] as RootContent[])
          : undefined;
      parent.children[index] = makeBlock(
        adapter,
        { lang: name, value: '', attributes },
        counter,
        extra,
        keep,
      );
      return SKIP;
    });
  };
}
