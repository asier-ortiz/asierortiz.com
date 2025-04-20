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
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        id: `${context.site}/blog/${post.slug}`,
        url: `${context.site}/blog/${post.slug}`,
        title: post.data.title,
        content_text: post.data.description,
        date_published: new Date(post.data.pubDate).toISOString(),
        tags: post.data.tags ?? [],
        image: `${context.site}${post.data.image}`,
      })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json',
    },
  });
}
