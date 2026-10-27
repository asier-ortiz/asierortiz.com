import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { unified } from '@astrojs/markdown-remark';
import compress, { Default as compressDefaults } from 'astro-compress';
import icon from 'astro-icon';
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
  vite: {
    // Tailwind 3 through PostCSS: @astrojs/tailwind stops at Astro 5, and global.scss carries
    // the @tailwind directives itself.
    css: { postcss: { plugins: [tailwindcss(), autoprefixer()] } },
    // Vite 8 builds for Safari 16.4 by default, and its CSS minifier then turns every min-width
    // query into range syntax that older Safari ignores (iPhone 6s/7 and macOS Catalina stop at
    // 15); the astro-compress pass below does not undo it. Rolldown adds es2020 itself and
    // rejects it in this list.
    build: { target: ['chrome87', 'edge88', 'firefox78', 'safari15', 'ios15'] },
    // Pre-bundle every package the browser loads (islands and page scripts alike), so the dev
    // server never discovers one mid-session: that re-optimisation changes the dependency hashes
    // and leaves modules already served pointing at outdated files ("Failed to fetch dynamically
    // imported module", 404s, or a second copy of Vue that breaks hydration).
    optimizeDeps: {
      include: [
        'animejs/lib/anime.es.js',
        'date-fns',
        'date-fns/locale',
        'fuse.js',
        'lodash.debounce',
        'lodash.throttle',
        'photoswipe',
        'photoswipe/lightbox',
        'tsparticles-engine',
        'tsparticles-preset-stars',
        'vue',
      ],
    },
  },
  site: 'https://asierortiz.com',
  // Astro 7 defaults to JSX whitespace rules, which drop the space between elements written on
  // separate lines ("this?Reply by email."); the templates are written for HTML's rules.
  compressHTML: true,
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
    // Rasters are already optimised by astro:assets, and astro-compress's own image pass is a
    // no-op on lossy WebP (its size check measures the UTF-8 length of binary data), so it is
    // off. The SVG pass keeps role="img" on the diagrams, which svgo strips by default.
    compress({
      Image: false,
      // astro-compress targets iOS 18.5, so lightningcss rewrites min-width queries into range
      // syntax that Safari before 16.4 ignores (iPhone 6s/7 and macOS Catalina stop at 15).
      CSS: { lightningcss: { targets: { ios_saf: 15 << 16, safari: 15 << 16 } } },
      HTML: {
        'html-minifier-terser': {
          // Vue renders a closed v-if as an empty comment and looks for it when hydrating, so the
          // minifier must keep it. The option replaces the default list rather than extending it.
          ignoreCustomComments: [
            ...compressDefaults.HTML['html-minifier-terser'].ignoreCustomComments,
            /^$/,
          ],
        },
      },
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
    // Astro 7 renders Markdown with Sätteri by default, which does not run rehype plugins; the
    // unified processor keeps the pipeline these two are written for.
    processor: unified({
      rehypePlugins: [rehypeTableWrap, rehypeImageSize],
    }),
  },
  server: {
    port: 3_000,
  },
});
