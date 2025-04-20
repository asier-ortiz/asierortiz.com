import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteData from '@/config/siteData.json';

export async function GET(context) {
  const posts = await getCollection('blog');

  return rss({
    title: siteData.rss.title,
    description: siteData.rss.description,
    site: context.site,
    xmlns: {
      media: "https://search.yahoo.com/mrss/",
    },
    customData: `
      <language>${siteData.language}</language>
      <copyright>© ${new Date().getFullYear()} ${siteData.author.name}</copyright>
    `,
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        link: `/blog/${post.slug}`,
        pubDate: post.data.pubDate,
        customData: `
          ${post.data.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n') || ''}
          <media:content url="${context.site}${post.data.image}" medium="image" />
        `,
      })),
  });
}
