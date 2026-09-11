import { getCollection } from 'astro:content';

/**
 * Posts per listing page. Below this many posts the pager, the "Page N of M"
 * line and the /blog/tag/ routes are not generated at all.
 */
export const POSTS_PER_PAGE = 10;

/** URL of listing page n: /blog/ for the first, /blog/page/n/ after that. */
export const blogPageUrl = (n: number) => (n <= 1 ? '/blog/' : `/blog/page/${n}/`);

export interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  prevUrl?: string;
  nextUrl?: string;
}

/** Position and Newer/Older links for listing page `currentPage` of `lastPage`. */
export function paginationInfo(currentPage: number, lastPage: number): PaginationInfo {
  return {
    currentPage,
    lastPage,
    prevUrl: currentPage > 1 ? blogPageUrl(currentPage - 1) : undefined,
    nextUrl: currentPage < lastPage ? blogPageUrl(currentPage + 1) : undefined,
  };
}

// Drafts are left out of production builds but kept in `astro dev`,
// so a post can be previewed at its URL and in the listing before publishing.
export async function getPublishedPosts() {
  return (await getCollection('blog')).filter(
    (post) => !post.data.draft || import.meta.env.DEV
  );
}

/** Published posts, newest first: the order every listing uses. */
export async function getPublishedPostsSorted() {
  return (await getPublishedPosts()).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
}
