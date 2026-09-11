/**
 * Joins a site-relative path onto the configured site origin.
 * `${Astro.site}${path}` yields `https://x.com//path`, because `Astro.site`
 * carries a trailing slash and every path here starts with one.
 */
export function absoluteUrl(path: string, site: URL | string | undefined): string {
  return site ? new URL(path, site).href : path;
}
