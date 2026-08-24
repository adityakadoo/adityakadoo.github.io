import type { Parent, Root, RootContent } from 'mdast';
import remarkDeflist from 'remark-deflist';
import { visit } from 'unist-util-visit';

const MATH_TYPES = new Set(['inlineMath', 'math']);

function isParent(node: RootContent): node is RootContent & Parent {
  return 'children' in node && Array.isArray((node as Parent).children);
}

function snapshotChildren(tree: Root): Map<Parent, RootContent[]> {
  const snapshot = new Map<Parent, RootContent[]>();
  const walk = (parent: Parent) => {
    snapshot.set(parent, [...(parent.children as RootContent[])]);
    for (const child of parent.children as RootContent[]) {
      if (isParent(child)) walk(child);
    }
  };
  walk(tree);
  return snapshot;
}

/**
 * remark-deflist rebuilds terms and details through `fromMarkdown`, so the new
 * `descriptionlist` has no position and later plugins cannot tell whether the
 * next block was written tight against it. Span the nodes it replaced.
 */
function restorePositions(tree: Root, snapshot: Map<Parent, RootContent[]>): void {
  const walk = (parent: Parent) => {
    const before = snapshot.get(parent);
    const after = parent.children as RootContent[];
    if (before) {
      const survivors = new Set(before);
      let oldIndex = 0;
      for (let i = 0; i < after.length; i++) {
        const node = after[i];
        if (survivors.has(node)) {
          oldIndex = before.indexOf(node, oldIndex) + 1;
          continue;
        }
        const nextSurvivor = after.slice(i + 1).find((sibling) => survivors.has(sibling));
        const stop = nextSurvivor ? before.indexOf(nextSurvivor, oldIndex) : before.length;
        const replaced = before.slice(oldIndex, stop).filter((old) => old.position);
        if (!node.position && replaced.length) {
          node.position = {
            start: replaced[0].position!.start,
            end: replaced[replaced.length - 1].position!.end,
          };
        }
        oldIndex = stop;
      }
    }
    for (const child of after) {
      if (isParent(child)) walk(child);
    }
  };
  walk(tree);
}

export function remarkDeflistSafe() {
  const inner = remarkDeflist() as (tree: Root, file: unknown) => void;
  return (tree: Root, file: unknown) => {
    const stash = new Map<string, RootContent>();
    let n = 0;

    visit(tree, (node, index, parent) => {
      if (index === undefined || !parent) return;
      if (!MATH_TYPES.has(node.type)) return;
      const key = `\u00ABmath${n++}\u00BB`;
      stash.set(key, node as RootContent);
      parent.children[index] = { type: 'text', value: key };
    });

    const snapshot = snapshotChildren(tree);
    inner(tree, file);
    restorePositions(tree, snapshot);

    visit(tree, 'text', (node, index, parent) => {
      if (index === undefined || !parent) return;
      if (stash.size === 0) return;
      if (stash.has(node.value)) {
        parent.children[index] = stash.get(node.value)!;
        return;
      }
      const keys = [...stash.keys()].filter((key) => node.value.includes(key));
      if (keys.length === 0) return;
      const parts: RootContent[] = [];
      let rest = node.value;
      while (rest.length) {
        let earliest = -1;
        let hit = '';
        for (const key of keys) {
          const at = rest.indexOf(key);
          if (at !== -1 && (earliest === -1 || at < earliest)) {
            earliest = at;
            hit = key;
          }
        }
        if (earliest === -1) {
          parts.push({ type: 'text', value: rest });
          break;
        }
        if (earliest > 0) parts.push({ type: 'text', value: rest.slice(0, earliest) });
        parts.push(stash.get(hit)!);
        rest = rest.slice(earliest + hit.length);
      }
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}
