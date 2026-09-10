import { getCollection } from 'astro:content';

// Drafts are left out of production builds but kept in `astro dev`,
// so a post can be previewed at its URL and in the listing before publishing.
export async function getPublishedPosts() {
  return (await getCollection('blog')).filter(
    (post) => !post.data.draft || import.meta.env.DEV
  );
}
