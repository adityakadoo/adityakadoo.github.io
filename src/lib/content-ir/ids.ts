import type { Root, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { getBlock } from './registry';
import type { ContentBlockData } from './types';

type DataBag = {
  irId?: string;
  block?: ContentBlockData;
  hName?: string;
  hProperties?: Record<string, unknown>;
};

function dataOf(node: RootContent): DataBag {
  return ((node as { data?: DataBag }).data ??= {}) as DataBag;
}

export function getIrId(node: RootContent): string | undefined {
  const data = (node as { data?: DataBag }).data;
  return data?.irId ?? data?.block?.id;
}

export function setIrId(node: RootContent, id: string): void {
  const data = dataOf(node);
  data.irId = id;
  const props = { ...(data.hProperties ?? {}) };
  props.dataIrId = id;
  data.hProperties = props;
}

function blockData(node: RootContent): ContentBlockData | undefined {
  if (node.type !== 'contentBlock') return undefined;
  return dataOf(node).block;
}

/** Children that walkIr narrates on their own, so they need their own id. */
const NESTED_BLOCKS = new Set(['list', 'descriptionlist', 'blockquote', 'code', 'table']);

/**
 * Assigns document-order speech IDs onto the mdast (and HTML via hProperties).
 * Visit order matches walkIr so audio cues and DOM nodes share ids.
 */
export function stampIrIds(tree: Root): { math: string[]; code: string[]; table: string[]; dl: string[] } {
  let seq = 0;
  const queues = { math: [] as string[], code: [] as string[], table: [] as string[], dl: [] as string[] };

  const visitNestedBlocks = (nodes: RootContent[]) => {
    for (const child of nodes) {
      if (NESTED_BLOCKS.has(child.type)) visit([child]);
    }
  };

  const visit = (nodes: RootContent[]) => {
    for (const node of nodes) {
      const block = blockData(node);

      if (node.type === 'heading') {
        seq += 1;
        setIrId(node, `heading-${seq}`);
        continue;
      }

      if (block) {
        const adapter = getBlock(block.name);
        if (block.name === 'clip' && 'children' in node) {
          visit(node.children as RootContent[]);
          continue;
        }
        seq += 1;
        setIrId(node, block.id);
        if (adapter?.keepChildren && 'children' in node) {
          visit(node.children as RootContent[]);
        }
        continue;
      }

      if (node.type === 'paragraph') {
        const text = toString(node).replace(/\s+/g, ' ').trim();
        if (!text) continue;
        seq += 1;
        setIrId(node, `p-${seq}`);
        continue;
      }

      if (node.type === 'blockquote') {
        const text = toString(node).trim();
        if (text) {
          seq += 1;
          setIrId(node, `quote-${seq}`);
        }
        if ('children' in node) visitNestedBlocks(node.children as RootContent[]);
        continue;
      }

      if (node.type === 'list' && 'children' in node) {
        seq += 1;
        setIrId(node, `list-${seq}`);
        visit(node.children as RootContent[]);
        continue;
      }

      if (node.type === 'listItem') {
        const text = toString(node).trim();
        if (text) {
          seq += 1;
          setIrId(node, `li-${seq}`);
        }
        if ('children' in node) visitNestedBlocks(node.children as RootContent[]);
        continue;
      }

      if (node.type === 'descriptionlist' && 'children' in node) {
        seq += 1;
        const id = `dl-${seq}`;
        setIrId(node, id);
        queues.dl.push(id);
        visit(node.children as RootContent[]);
        continue;
      }

      if (node.type === 'descriptionterm') {
        seq += 1;
        setIrId(node, `dt-${seq}`);
        continue;
      }

      if (node.type === 'descriptiondetails') {
        seq += 1;
        setIrId(node, `dd-${seq}`);
        if ('children' in node) visitNestedBlocks(node.children as RootContent[]);
        continue;
      }

      if (node.type === 'code') {
        seq += 1;
        const id = `code-${seq}`;
        setIrId(node, id);
        queues.code.push(id);
        continue;
      }

      if (node.type === 'table') {
        seq += 1;
        const id = `table-${seq}`;
        setIrId(node, id);
        queues.table.push(id);
        continue;
      }

      if (node.type === 'math') {
        seq += 1;
        const id = `math-${seq}`;
        const data = dataOf(node);
        data.irId = id;
        const props = { ...(data.hProperties ?? {}) };
        props.dataIrId = id;
        data.hProperties = props;
        queues.math.push(id);
        continue;
      }

      if ('children' in node && Array.isArray(node.children)) {
        visit(node.children as RootContent[]);
      }
    }
  };

  visit(tree.children as RootContent[]);
  return queues;
}
