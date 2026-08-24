import type { Root } from 'hast';

function classList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

type HastEl = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastEl[];
};

export function rehypeIrIds() {
  return (tree: Root, file: { data?: Record<string, unknown> }) => {
    const queues = (file.data?.irIds ?? { math: [], code: [], table: [], dl: [] }) as {
      math: string[];
      code: string[];
      table: string[];
      dl: string[];
    };
    let mathI = 0;
    let codeI = 0;
    let tableI = 0;
    let dlI = 0;

    const walk = (node: HastEl, ancestorHasIr: boolean) => {
      if (node.type !== 'element') {
        for (const child of node.children ?? []) walk(child, ancestorHasIr);
        return;
      }
      const cls = classList(node.properties?.className);
      const props = (node.properties ??= {});
      const hasIr = ancestorHasIr || typeof props.dataIrId === 'string';

      if (!props.dataIrId) {
        if (
          !ancestorHasIr &&
          (cls.includes('katex-display') || cls.includes('math-display') || cls.includes('ir-math')) &&
          mathI < queues.math.length
        ) {
          props.dataIrId = queues.math[mathI++];
        } else if (node.tagName === 'dl' && dlI < queues.dl.length) {
          props.dataIrId = queues.dl[dlI++];
        } else if (node.tagName === 'pre' && !cls.includes('mermaid') && codeI < queues.code.length) {
          props.dataIrId = queues.code[codeI++];
        } else if (node.tagName === 'table' && tableI < queues.table.length) {
          props.dataIrId = queues.table[tableI++];
        }
      }

      const nextAncestor = hasIr || typeof props.dataIrId === 'string';
      for (const child of node.children ?? []) walk(child, nextAncestor);
    };

    walk(tree as unknown as HastEl, false);
  };
}
