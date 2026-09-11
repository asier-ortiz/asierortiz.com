import { getPublishedPosts } from '@/utils/posts';
import siteData from '@/config/siteData.json';
import { absoluteUrl } from '@/utils/absoluteUrl';

export async function GET(context) {
  const posts = await getPublishedPosts();

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: siteData.rss.title,
    home_page_url: context.site,
    feed_url: absoluteUrl('/feed.json', context.site),
    description: siteData.rss.description,
    language: siteData.language,
    favicon: absoluteUrl('/favicon.ico', context.site),
    items: posts
      .map((post) => ({
        id: absoluteUrl(`/blog/${post.slug}/`, context.site),
        url: absoluteUrl(`/blog/${post.slug}/`, context.site),
        title: post.data.title,
        content_html: `
          <img src="${absoluteUrl(post.data.image, context.site)}" alt="${post.data.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 1em;" />
          <p>${post.data.description}</p>
          <p><a href="${absoluteUrl(`/blog/${post.slug}/`, context.site)}">→ Read the full post</a></p>
        `,
        summary: post.data.description,
        date_published: new Date(post.data.pubDate).toISOString(),
        tags: post.data.tags ?? [],
        image: absoluteUrl(post.data.image, context.site),
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
