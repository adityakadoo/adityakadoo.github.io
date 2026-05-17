// @ts-check
import { defineConfig } from 'astro/config';
import remarkDeflist from 'remark-deflist';
import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
  site: 'https://adityakadoo.github.io',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGfm, remarkDeflist],
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
