import rss from '@astrojs/rss';
import { getPublishedPosts } from '@/utils/posts';
import siteData from '@/config/siteData.json';
import { absoluteUrl } from '@/utils/absoluteUrl';

export async function GET(context) {
  const posts = await getPublishedPosts();

  const title = `${siteData.author.name} - Blog`;

  return rss({
    title,
    description: siteData.blog.description,
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      media: 'http://search.yahoo.com/mrss/',
      content: 'http://purl.org/rss/1.0/modules/content/',
    },
    customData: `
      <atom:link href="${absoluteUrl('/rss.xml', context.site)}" rel="self" type="application/rss+xml" />
      <language>${siteData.language}</language>
      <copyright>© ${new Date().getFullYear()} ${siteData.author.name}</copyright>
      <image>
        <url>${absoluteUrl(siteData.defaultImage.src.src, context.site)}</url>
        <title>${title}</title>
        <link>${context.site}</link>
      </image>
    `,
    items: posts
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        link: `/blog/${post.slug}`,
        pubDate: post.data.pubDate,
        author: `${siteData.author.email} (${siteData.author.name})`,
        customData: `
          ${post.data.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n') || ''}
          <media:content url="${absoluteUrl(post.data.image.src, context.site)}" medium="image" />
          <content:encoded><![CDATA[
            <img src="${absoluteUrl(post.data.image.src, context.site)}" alt="${post.data.title}" />
            <p>${post.data.description}</p>
            <p><a href="${absoluteUrl(`/blog/${post.slug}/`, context.site)}">→ Read the full post</a></p>
          ]]></content:encoded>
        `,
      })),
  });
}
