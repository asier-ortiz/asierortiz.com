import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';
import icon from 'astro-icon';
import remarkExtractHeadings from './src/utils/remarkHeadings.ts';
import rehypeTableWrap from './src/utils/rehypeTableWrap.ts';
import rehypeImageSize from './src/utils/rehypeImageSize.ts';

// Sitemap <lastmod> comes from the posts' frontmatter: a post's own date, and for the
// listing and the tag pages the newest post they contain. Read from disk because the
// content collection is not available at config time.
const posts = readdirSync('src/content/blog')
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const source = readFileSync(`src/content/blog/${file}`, 'utf8');
    const field = (name) => source.match(new RegExp(`^${name}:\\s*"?([^"\\n]+)`, 'm'))?.[1]?.trim();
    const tags = (source.match(/^tags:\s*(.+)$/m)?.[1] ?? '').match(/[a-z0-9-]+/g) ?? [];
    return { slug: file.replace(/\.md$/, ''), date: field('updatedDate') ?? field('pubDate'), tags };
  });
const newest = (list) => list.map((post) => post.date).sort().at(-1);
const lastmodFor = (pathname) => {
  const post = pathname.match(/^\/blog\/([^/]+)\/$/)?.[1];
  if (post) return posts.find((p) => p.slug === post)?.date;
  const tag = pathname.match(/^\/blog\/tag\/([^/]+)\/$/)?.[1];
  if (tag) return newest(posts.filter((p) => p.tags.includes(tag)));
  if (pathname === '/' || pathname.startsWith('/blog/')) return newest(posts);
  return undefined;
};

export default defineConfig({
  site: 'https://asierortiz.com',
  // Only links marked data-astro-prefetch (the blog pager) are prefetched.
  prefetch: true,
  trailingSlash: 'ignore',
  integrations: [
    vue(),
    sitemap({
      // Landing page for newsletter confirmations; only reachable from the email link.
      filter: (page) => new URL(page).pathname !== '/confirmed/',
      serialize: (item) => {
        const lastmod = lastmodFor(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod: new Date(lastmod).toISOString() } : item;
      },
    }),
    icon(),
    mdx(),
    tailwind(),
    // Rasters are already optimised by astro:assets, and astro-compress's own image pass is a
    // no-op on lossy WebP (its size check measures the UTF-8 length of binary data), so it is
    // off. The SVG pass keeps role="img" on the diagrams, which svgo strips by default.
    compress({
      Image: false,
      SVG: {
        svgo: {
          plugins: [
            { name: 'preset-default', params: { overrides: { removeUnknownsAndDefaults: { keepRoleAttr: true } } } },
          ],
        },
      },
    }),
  ],
  markdown: {
    // Astro's default theme (github-dark) renders comments at 3:1 on its background.
    // github-dark-default keeps GitHub's palette with comments above 6:1, on a
    // near-black background that matches the site.
    shikiConfig: { theme: 'github-dark-default' },
    remarkPlugins: [remarkExtractHeadings],
    rehypePlugins: [rehypeTableWrap, rehypeImageSize],
  },
  server: {
    port: 3_000,
  },
  pageExtensions: ['astro', 'md', 'mdx', 'ts'],
});
