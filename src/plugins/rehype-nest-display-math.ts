type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function classList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function isDisplayMath(node: HastNode): boolean {
  if (node.type !== 'element') return false;
  const cls = classList(node.properties?.className);
  if (cls.includes('katex-display') || cls.includes('math-display') || cls.includes('ir-math')) return true;
  return node.tagName === 'pre' && cls.some((c) => c === 'math-display' || c === 'math');
}

function lastFlowTarget(node: HastNode): HastNode | undefined {
  const kids = node.children ?? [];
  if (node.tagName === 'dl') {
    for (let i = kids.length - 1; i >= 0; i--) {
      if (kids[i].tagName === 'dd') return kids[i];
    }
  }
  if (node.tagName === 'ul' || node.tagName === 'ol') {
    for (let i = kids.length - 1; i >= 0; i--) {
      if (kids[i].tagName === 'li') return kids[i];
    }
  }
  if (node.tagName === 'li' || node.tagName === 'dd' || node.tagName === 'blockquote') return node;
  return undefined;
}

/**
 * Display math often serializes as a sibling of `<dl>` / `<li>` even when the
 * mdast parented it. Re-home following KaTeX/math nodes into the last `dd`/`li`.
 */
export function rehypeNestDisplayMath() {
  return (tree: HastNode) => {
    const walk = (parent: HastNode) => {
      const children = parent.children ?? [];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (node.children) walk(node);

        const target = lastFlowTarget(node);
        if (!target) continue;

        while (i + 1 < children.length && isDisplayMath(children[i + 1])) {
          const next = children.splice(i + 1, 1)[0];
          (target.children ??= []).push(next);
        }
      }
    };

    walk(tree);
  };
}
