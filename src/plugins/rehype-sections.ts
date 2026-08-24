type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/**
 * Wrap each markdown `h2` and the nodes that follow it (until the next `h2`)
 * in a `<section>`.
 */
export function rehypeSections() {
  return (tree: HastNode) => {
    const wrap = (parent: HastNode) => {
      const children = parent.children ?? [];
      for (const child of children) wrap(child);

      const next: HastNode[] = [];
      let section: HastNode | null = null;

      const flush = () => {
        if (section) next.push(section);
        section = null;
      };

      for (const child of children) {
        const isH2 = child.type === 'element' && child.tagName === 'h2';
        if (isH2) {
          flush();
          section = {
            type: 'element',
            tagName: 'section',
            properties: {},
            children: [child],
          };
          continue;
        }
        if (section) {
          section.children!.push(child);
        } else {
          next.push(child);
        }
      }

      flush();
      parent.children = next;
    };

    wrap(tree);
  };
}
