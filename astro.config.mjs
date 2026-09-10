import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';
import icon from 'astro-icon';
import remarkExtractHeadings from './src/utils/remarkHeadings.ts';
import rehypeTableWrap from './src/utils/rehypeTableWrap.ts';

export default defineConfig({
  site: 'https://asierortiz.com',
  trailingSlash: 'ignore',
  integrations: [
    vue(),
    sitemap({
      // Landing page for newsletter confirmations; only reachable from the email link.
      filter: (page) => !page.includes('/confirmed'),
    }),
    icon(),
    mdx(),
    tailwind(),
    compress(),
  ],
  markdown: {
    remarkPlugins: [remarkExtractHeadings],
    rehypePlugins: [rehypeTableWrap],
  },
  server: {
    port: 3_000,
  },
  pageExtensions: ['astro', 'md', 'mdx', 'ts'],
});
