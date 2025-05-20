import { getCollection } from 'astro:content';
import siteData from '@/config/siteData.json';

export async function GET(context) {
  const posts = await getCollection('blog');
  const siteUrl = context.site.replace(/\/$/, '');

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: siteData.rss.title,
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: siteData.rss.description,
    language: siteData.language,
    favicon: `${siteUrl}/favicon.ico`,
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        id: `${siteUrl}/blog/${post.slug}`,
        url: `${siteUrl}/blog/${post.slug}`,
        title: post.data.title,
        content_html: `
          <img src="${siteUrl}${post.data.image}" alt="${post.data.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 1em;" />
          <p>${post.data.description}</p>
          <p><a href="${siteUrl}/blog/${post.slug}">→ Read the full post</a></p>
        `,
        summary: post.data.description,
        date_published: new Date(post.data.pubDate).toISOString(),
        tags: post.data.tags ?? [],
        image: `${siteUrl}${post.data.image}`,
        author: {
          name: siteData.author.name,
          url: `mailto:${siteData.author.email}`,
        },
      })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json',
    },
  });
}
