import GithubSlugger from 'github-slugger';
import type { Heading, PhrasingContent, Root, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { headingHtml } from './heading-html';
import { getIrId, stampIrIds } from './ids';
import { getBlock } from './registry';
import { speakTeX, speakTeXChunks, ssmlEscape } from './math-speech';
import type { ContentBlockData, IrHeading, SpeechUnit } from './types';
import { cardVisual } from './visuals';

type SpeakNode = {
  type?: string;
  value?: string;
  children?: SpeakNode[];
};

/** Children that carry their own announcements instead of folding into prose. */
const NESTED_BLOCKS = new Set(['list', 'descriptionlist', 'blockquote', 'code', 'table']);

function blockData(node: RootContent): ContentBlockData | undefined {
  if (node.type !== 'contentBlock') return undefined;
  const data = node.data as { block?: ContentBlockData } | undefined;
  return data?.block;
}

function speakAbbrToken(word: string): string {
  return word.replace(/\[([A-Za-z0-9]+)\]/g, (_, abbr: string) => `abbreviated ${abbr.split('').join(' ')}`);
}

function phrasingChunks(nodes: SpeakNode[] | undefined): string[] {
  const chunks: string[] = [];
  const addText = (s: string) => {
    for (const w of s.split(/\s+/)) {
      if (w) chunks.push(speakAbbrToken(w));
    }
  };
  for (const node of nodes ?? []) {
    if (node.type === 'inlineMath' || node.type === 'math') chunks.push(...speakTeXChunks(node.value ?? ''));
    else if (node.type === 'inlineCode') {
      const code = (node.value ?? '').trim();
      if (code) chunks.push(code);
    } else if (node.type === 'break') continue;
    else if (node.type === 'text') addText(node.value ?? '');
    else if (node.children?.length) chunks.push(...phrasingChunks(node.children));
    else addText(toString(node as PhrasingContent));
  }
  return chunks;
}

function phrase(
  text: string,
  kind: SpeechUnit['kind'],
  opts: { breakMs?: number } = {},
): { text: string; ssml: string } {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  const pause = opts.breakMs ? `<break time="${opts.breakMs}ms"/>` : '';
  const tail = kind === 'heading' ? '<break time="400ms"/>' : '';
  const ssml = `${pause}<s>${ssmlEscape(trimmed)}</s>${tail}`;
  return { text: trimmed, ssml };
}

function requireId(node: RootContent, fallback: string): string {
  return getIrId(node) ?? fallback;
}

export function walkIr(
  tree: Root,
  opts: { clipAll?: boolean } = {},
): { headings: IrHeading[]; units: SpeechUnit[] } {
  stampIrIds(tree);
  const slugger = new GithubSlugger();
  const headings: IrHeading[] = [];
  const units: SpeechUnit[] = [];
  const headingCounters: Record<number, number> = {};

  function headingNumber(depth: number): string {
    for (const key of Object.keys(headingCounters)) {
      if (Number(key) > depth) delete headingCounters[Number(key)];
    }
    headingCounters[depth] = (headingCounters[depth] ?? 0) + 1;
    return Object.keys(headingCounters)
      .map(Number)
      .sort((a, b) => a - b)
      .map((d) => headingCounters[d])
      .join('.');
  }

  const push = (
    node: RootContent,
    kind: SpeechUnit['kind'],
    chunks: string[],
    extra: {
      lead?: string;
      breakMs?: number;
      kicker?: string;
      fallback?: string;
      depth?: number;
      slug?: string;
      visualText?: string;
      clip?: boolean;
      highlight?: SpeechUnit['highlight'];
      blockId?: string;
    } = {},
  ) => {
    const normChunks = chunks.map((c) => c.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const body = normChunks.join(' ');
    const text = [extra.lead, body].filter(Boolean).join(' ');
    if (!text) return;
    const spoken = phrase(text, kind, { breakMs: extra.breakMs });
    units.push({
      nodeId: requireId(node, `${kind}-${units.length + 1}`),
      kind,
      category: kind === 'code' || kind === 'table' ? 2 : 1,
      ...spoken,
      chunks: normChunks.length ? normChunks : undefined,
      highlight: extra.highlight,
      blockId: extra.blockId,
      depth: extra.depth,
      slug: extra.slug,
      clip: extra.clip ?? false,
      visual: cardVisual(extra.visualText ?? extra.fallback ?? body, { kicker: extra.kicker }),
      frames: null,
    });
  };

  const visit = (nodes: RootContent[], clip: boolean) => {
    for (const node of nodes) {
      const clipHere = clip || opts.clipAll === true;
      const block = blockData(node);

      if (node.type === 'heading') {
        const text = toString(node).trim();
        const chunks = phrasingChunks(node.children as SpeakNode[])
          .map((c) => c.replace(/\s+/g, ' ').trim())
          .filter(Boolean);
        const slug = slugger.slug(text);
        const nodeId = requireId(node, `heading-${headings.length + 1}`);
        headings.push({ depth: node.depth, text, html: headingHtml(node), slug, nodeId });
        const spokenText = chunks.join(' ') || text;
        const number = headingNumber(node.depth);
        const lead = `Section ${number}.`;
        const spoken = phrase([lead, spokenText].filter(Boolean).join(' '), 'heading');
        units.push({
          nodeId,
          kind: 'heading',
          category: 1,
          ...spoken,
          chunks: chunks.length ? chunks : undefined,
          highlight: 'words',
          depth: node.depth,
          slug,
          clip: clipHere,
          visual: cardVisual(text, { kicker: `Section ${number}` }),
          frames: null,
        });
        continue;
      }

      if (block) {
        const adapter = getBlock(block.name);
        const nextClip = clipHere || block.name === 'clip' || Boolean(block.props.clip);
        if (block.name === 'clip' && 'children' in node) {
          visit(node.children as RootContent[], true);
          continue;
        }
        if (adapter?.keepChildren && 'children' in node) {
          const caption = adapter.caption(block);
          if (caption && block.name === 'callout') {
            const spoken = phrase(caption, 'caption');
            units.push({
              nodeId: requireId(node, block.id),
              kind: 'caption',
              category: adapter.category,
              ...spoken,
              highlight: 'block',
              clip: nextClip,
              visual: adapter.visual(block),
              frames: adapter.frames(block),
            });
          }
          visit(node.children as RootContent[], nextClip);
          continue;
        }
        if (adapter) {
          const isInteractive = adapter.category === 4;
          const text = isInteractive
            ? (adapter.fallback(block) ?? adapter.caption(block))
            : adapter.caption(block);
          const spoken = phrase(text, isInteractive ? 'fallback' : 'caption');
          units.push({
            nodeId: requireId(node, block.id),
            kind: isInteractive ? 'fallback' : 'caption',
            category: adapter.category,
            ...spoken,
            highlight: 'block',
            clip: nextClip,
            visual: adapter.visual(block),
            frames: adapter.frames(block),
            poster: block.poster,
          });
        }
        continue;
      }

      if (node.type === 'paragraph') {
        const chunks = phrasingChunks(node.children as SpeakNode[]);
        push(node, 'prose', chunks, { visualText: toString(node).trim(), clip: clipHere });
        continue;
      }

      if (node.type === 'blockquote' && 'children' in node) {
        const nested: RootContent[] = [];
        const inline: SpeakNode[] = [];
        for (const child of (node.children ?? []) as RootContent[]) {
          if (NESTED_BLOCKS.has(child.type)) nested.push(child);
          else if (child.type === 'paragraph' && 'children' in child) {
            inline.push(...((child.children ?? []) as SpeakNode[]));
          } else inline.push(child as SpeakNode);
        }
        const chunks = phrasingChunks(inline);
        if (chunks.length || nested.length) {
          push(node, 'prose', [], {
            lead: 'Quote.',
            breakMs: 350,
            kicker: 'quote',
            highlight: 'block',
            visualText: toString(node).trim(),
            clip: clipHere,
          });
        }
        if (chunks.length) {
          push(node, 'prose', chunks, {
            kicker: 'quote',
            highlight: 'words',
            visualText: toString(node).trim(),
            clip: clipHere,
          });
        }
        for (const child of nested) visit([child], clipHere);
        continue;
      }

      if (node.type === 'descriptionlist' && 'children' in node) {
        const dlId = requireId(node, `dl-${units.length + 1}`);
        const kids = node.children as RootContent[];
        for (let i = 0; i < kids.length; i++) {
          const kid = kids[i];
          if (kid.type !== 'descriptionterm') {
            visit([kid], clipHere);
            continue;
          }
          const details: RootContent[] = [];
          while (i + 1 < kids.length && kids[i + 1].type === 'descriptiondetails') {
            details.push(kids[++i]);
          }
          const termChunks = phrasingChunks(kid.children as SpeakNode[]);
          const detailChunks: string[] = [];
          const nestedBlocks: RootContent[] = [];
          for (const d of details) {
            for (const child of ((d as SpeakNode).children ?? []) as SpeakNode[]) {
              if (child.type && NESTED_BLOCKS.has(child.type)) {
                nestedBlocks.push(child as unknown as RootContent);
              } else if (child.type === 'paragraph' && child.children) {
                detailChunks.push(...phrasingChunks(child.children));
              } else {
                detailChunks.push(...phrasingChunks([child]));
              }
            }
          }
          if (termChunks.length) {
            push(kid, 'prose', termChunks, {
              lead: 'Definition of',
              breakMs: 450,
              kicker: 'definition',
              highlight: 'block',
              blockId: dlId,
              visualText: toString(kid).trim(),
              clip: clipHere,
            });
          }
          if (detailChunks.length && details[0]) {
            push(details[0], 'prose', detailChunks, {
              breakMs: 280,
              kicker: 'definition',
              highlight: 'words',
              visualText: toString(details[0]).trim(),
              clip: clipHere,
            });
          }
          for (const child of nestedBlocks) visit([child], clipHere);
        }
        continue;
      }

      if (node.type === 'list' && 'children' in node) {
        visitList(node, clipHere, 0);
        continue;
      }

      if (node.type === 'code') {
        const lang = node.lang ? ` in ${node.lang}` : '';
        const spoken = phrase(`Code listing${lang}.`, 'code');
        units.push({
          nodeId: requireId(node, `code-${units.length + 1}`),
          kind: 'code',
          category: 2,
          ...spoken,
          highlight: 'block',
          clip: clipHere,
          visual: cardVisual(node.value.slice(0, 280) || `Code${lang}`, { kicker: node.lang || 'code' }),
          frames: null,
        });
        continue;
      }

      if (node.type === 'table') {
        const spoken = phrase('A table.', 'table');
        units.push({
          nodeId: requireId(node, `table-${units.length + 1}`),
          kind: 'table',
          category: 2,
          ...spoken,
          highlight: 'block',
          clip: clipHere,
          visual: cardVisual('A table.', { kicker: 'table' }),
          frames: null,
        });
        continue;
      }

      if (node.type === 'math') {
        const chunks = speakTeXChunks(node.value);
        const spoken = phrase(chunks.join(' ') || speakTeX(node.value), 'math');
        units.push({
          nodeId: requireId(node, `math-${units.length + 1}`),
          kind: 'math',
          category: 1,
          ...spoken,
          chunks: chunks.length ? chunks : undefined,
          highlight: 'words',
          clip: clipHere,
          visual: cardVisual(spoken.text, { kicker: 'equation' }),
          frames: null,
        });
        continue;
      }

      if ('children' in node && Array.isArray(node.children)) {
        visit(node.children as RootContent[], clipHere);
      }
    }
  };

  const visitList = (
    list: RootContent & { children?: RootContent[]; ordered?: boolean | null; start?: number | null },
    clipHere: boolean,
    depth: number,
  ) => {
    const ordered = Boolean(list.ordered);
    const items = (list.children ?? []).filter((child) => child.type === 'listItem');
    if (items.length) {
      push(list, 'prose', [], {
        lead: 'Start of list.',
        breakMs: 280,
        kicker: 'list',
        highlight: 'block',
        visualText: toString(list).trim(),
        clip: clipHere,
      });
    }
    let n = list.start ?? 1;
    let itemIndex = 0;
    for (const child of list.children ?? []) {
      if (child.type !== 'listItem' || !('children' in child)) {
        visit([child], clipHere);
        continue;
      }
      const nested: RootContent[] = [];
      const deflists: RootContent[] = [];
      const direct: SpeakNode[] = [];
      for (const c of (child.children ?? []) as RootContent[]) {
        if (c.type === 'list') nested.push(c);
        else if (c.type === 'descriptionlist') deflists.push(c);
        else if (c.type === 'paragraph' && 'children' in c) direct.push(...((c.children ?? []) as SpeakNode[]));
        else direct.push(c as SpeakNode);
      }
      const chunks = phrasingChunks(direct);
      const isFirst = itemIndex === 0;
      if (!ordered && !isFirst && (chunks.length || deflists.length)) {
        push(list, 'prose', [], {
          lead: 'Next.',
          breakMs: 280,
          kicker: 'list',
          highlight: 'block',
          visualText: toString(list).trim(),
          clip: clipHere,
        });
      }
      if (chunks.length || deflists.length) {
        push(child, 'prose', chunks, {
          lead: ordered ? `${n}.` : undefined,
          breakMs: 320,
          kicker: 'list',
          highlight: 'words',
          visualText: toString(child).trim(),
          clip: clipHere,
        });
      }
      for (const d of deflists) visit([d], clipHere);
      for (const nl of nested) visitList(nl, clipHere, depth + 1);
      n += 1;
      itemIndex += 1;
    }
    if (items.length) {
      push(list, 'prose', [], {
        lead: 'End of list.',
        breakMs: 280,
        kicker: 'list',
        highlight: 'block',
        visualText: toString(list).trim(),
        clip: clipHere,
      });
    }
  };

  visit(tree.children as RootContent[], false);
  return { headings, units };
}

export function headingFromNode(node: Heading, slugger: GithubSlugger): { text: string; slug: string; depth: number } {
  const text = toString(node).trim();
  return { text, slug: slugger.slug(text), depth: node.depth };
}
