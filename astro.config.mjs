import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';
import icon from 'astro-icon';
import remarkSlug from 'remark-slug';

// https://astro.build/config
export default defineConfig({
  site: 'https://asierortiz.com',
  trailingSlash: 'always',
  integrations: [sitemap(), icon(), mdx(), tailwind(), sitemap(), compress()],
  markdown: {
    remarkPlugins: [remarkSlug],
  },
  server: {
    port: 3_000,
  },
});
