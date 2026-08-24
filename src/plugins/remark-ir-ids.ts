import type { Root } from 'mdast';
import { getIrId, stampIrIds } from '../lib/content-ir/ids';
import { visit } from 'unist-util-visit';

export function remarkIrIds() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    const queues = stampIrIds(tree);
    file.data.irIds = queues;
    const math: string[] = [];
    visit(tree, 'math', (node) => {
      const id = getIrId(node as never);
      if (id) math.push(id);
    });
    if (math.length) queues.math = math;
  };
}
