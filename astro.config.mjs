// @ts-check
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeIrIds } from './src/plugins/rehype-ir-ids.ts';
import { rehypeNestDisplayMath } from './src/plugins/rehype-nest-display-math.ts';
import { rehypeSections } from './src/plugins/rehype-sections.ts';
import { remarkAttachTightBlocks } from './src/plugins/remark-attach-tight-blocks.ts';
import { remarkContentBlocks } from './src/plugins/remark-content-blocks.ts';
import { remarkDeflistSafe } from './src/plugins/remark-deflist-safe.ts';
import { remarkIrIds } from './src/plugins/remark-ir-ids.ts';
import { remarkRepairMathFences } from './src/plugins/remark-repair-math-fences.ts';
import { remarkUnderline } from './src/plugins/remark-underline.ts';

export default defineConfig({
  site: 'https://adityakadoo.github.io',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: {
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      remarkRepairMathFences,
      remarkDeflistSafe,
      remarkAttachTightBlocks,
      remarkDirective,
      remarkUnderline,
      remarkContentBlocks,
      remarkIrIds,
    ],
    rehypePlugins: [
      rehypeSections,
      [rehypeKatex, { throwOnError: false, strict: false }],
      rehypeNestDisplayMath,
      rehypeIrIds,
    ],
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
