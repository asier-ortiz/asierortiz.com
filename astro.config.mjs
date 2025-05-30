import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';
import icon from 'astro-icon';
import remarkExtractHeadings from './src/utils/remarkHeadings.ts';

export default defineConfig({
  site: 'https://asierortiz.com',
  trailingSlash: 'ignore',
  integrations: [
    vue(),
    sitemap({
      changefreq: 'weekly',
      lastmod: true,
      sitemap: '/sitemap-index.xml',
    }),
    icon(),
    mdx(),
    tailwind(),
    compress(),
  ],
  markdown: {
    remarkPlugins: [remarkExtractHeadings],
  },
  server: {
    port: 3_000,
  },
  pageExtensions: ['astro', 'md', 'mdx', 'ts'],
});
