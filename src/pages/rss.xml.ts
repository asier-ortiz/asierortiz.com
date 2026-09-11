import rss from '@astrojs/rss';
import { getPublishedPosts } from '@/utils/posts';
import siteData from '@/config/siteData.json';
import { absoluteUrl } from '@/utils/absoluteUrl';

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: siteData.rss.title,
    description: siteData.rss.description,
    site: context.site,
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
      content: "http://purl.org/rss/1.0/modules/content/",
    },
    customData: `
      <language>${siteData.language}</language>
      <copyright>© ${new Date().getFullYear()} ${siteData.author.name}</copyright>
      <image>
        <url>${absoluteUrl(siteData.defaultImage.src, context.site)}</url>
        <title>${siteData.rss.title}</title>
        <link>${context.site}</link>
      </image>
    `,
    items: posts
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        link: `/blog/${post.slug}`,
        pubDate: post.data.pubDate,
        author: `${siteData.author.name} <${siteData.author.email}>`,
        customData: `
          ${post.data.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n') || ''}
          <media:content url="${absoluteUrl(post.data.image, context.site)}" medium="image" />
          <image>${absoluteUrl(post.data.image, context.site)}</image>
          <content:encoded><![CDATA[
            <img src="${absoluteUrl(post.data.image, context.site)}" alt="${post.data.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 1em;" />
            <p>${post.data.description}</p>
            <p><a href="${absoluteUrl(`/blog/${post.slug}/`, context.site)}">→ Read the full post</a></p>
          ]]></content:encoded>
        `,
      })),
  });
}
