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
      media: "http://search.yahoo.com/mrss/",
      content: "http://purl.org/rss/1.0/modules/content/",
    },
    customData: `
      <language>${siteData.language}</language>
      <copyright>© ${new Date().getFullYear()} ${siteData.author.name}</copyright>
      <image>
        <url>${context.site}${siteData.defaultImage.src}</url>
        <title>${siteData.title}</title>
        <link>${context.site}</link>
      </image>
    `,
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        link: `/blog/${post.slug}`,
        pubDate: post.data.pubDate,
        author: `${siteData.author.name} <${siteData.author.email}>`,
        customData: `
          ${post.data.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n') || ''}
          <media:content url="${context.site}${post.data.image}" medium="image" />
          <image>${context.site}${post.data.image}</image>
          <content:encoded><![CDATA[
            <img src="${context.site}${post.data.image}" alt="${post.data.title}" style="max-width: 100%; border-radius: 10px; margin-bottom: 1em;" />
            <p>${post.data.description}</p>
            <p><a href="${context.site}/blog/${post.slug}">→ Read the full post</a></p>
          ]]></content:encoded>
        `,
      })),
  });
}
