import type { Root } from 'mdast';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { remarkAttachTightBlocks } from '../../plugins/remark-attach-tight-blocks';
import { remarkContentBlocks } from '../../plugins/remark-content-blocks';
import { remarkDeflistSafe } from '../../plugins/remark-deflist-safe';
import { remarkIrIds } from '../../plugins/remark-ir-ids';
import { remarkRepairMathFences } from '../../plugins/remark-repair-math-fences';
import { remarkUnderline } from '../../plugins/remark-underline';
import { registerAllBlocks } from './blocks';

registerAllBlocks();

export function parseMarkdown(markdown: string): Root {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRepairMathFences)
    .use(remarkDeflistSafe)
    .use(remarkAttachTightBlocks)
    .use(remarkDirective)
    .use(remarkUnderline)
    .use(remarkContentBlocks)
    .use(remarkIrIds);
  return processor.runSync(processor.parse(markdown)) as Root;
}
