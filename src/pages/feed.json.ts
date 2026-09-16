import { getPublishedPosts } from '@/utils/posts';
import siteData from '@/config/siteData.json';
import { absoluteUrl } from '@/utils/absoluteUrl';

export async function GET(context) {
  const posts = await getPublishedPosts();

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${siteData.author.name} - Blog`,
    home_page_url: context.site,
    feed_url: absoluteUrl('/feed.json', context.site),
    description: siteData.blog.description,
    language: siteData.language,
    icon: absoluteUrl('/favicons/android-chrome-512x512.png', context.site),
    favicon: absoluteUrl('/favicon.ico', context.site),
    authors: [{ name: siteData.author.name, url: context.site }],
    items: posts
      .map((post) => ({
        id: absoluteUrl(`/blog/${post.slug}/`, context.site),
        url: absoluteUrl(`/blog/${post.slug}/`, context.site),
        title: post.data.title,
        content_html: `
          <img src="${absoluteUrl(post.data.image.src, context.site)}" alt="${post.data.title}" />
          <p>${post.data.description}</p>
          <p><a href="${absoluteUrl(`/blog/${post.slug}/`, context.site)}">→ Read the full post</a></p>
        `,
        summary: post.data.description,
        date_published: new Date(post.data.pubDate).toISOString(),
        date_modified: post.data.updatedDate?.toISOString(),
        tags: post.data.tags ?? [],
        image: absoluteUrl(post.data.image.src, context.site),
      })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json',
    },
  });
}
