import { getCollection } from 'astro:content';
import siteData from '@/config/siteData.json';

export async function GET(context) {
  const posts = await getCollection('blog');

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: siteData.rss.title,
    home_page_url: context.site,
    feed_url: `${context.site}/feed.json`,
    description: siteData.rss.description,
    language: siteData.language,
    favicon: `${context.site}/favicon.ico`,
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        id: `${context.site}/blog/${post.slug}`,
        url: `${context.site}/blog/${post.slug}`,
        title: post.data.title,
        content_html: `
          <img src="${context.site}${post.data.image}" alt="${post.data.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 1em;" />
          <p>${post.data.description}</p>
          <p><a href="${context.site}/blog/${post.slug}">→ Read the full post</a></p>
        `,
        summary: post.data.description,
        date_published: new Date(post.data.pubDate).toISOString(),
        tags: post.data.tags ?? [],
        image: `${context.site}${post.data.image}`,
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
