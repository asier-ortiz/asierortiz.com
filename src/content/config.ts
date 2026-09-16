import { defineCollection, z } from 'astro:content';

/**
 * Tags are the themes a reader browses by, not the keywords of a post: the full-text
 * search already covers libraries, tools and product names. A theme earns a place here
 * when a second post needs it; anything else fails the build.
 */
const TAGS = [
  'ai',
  'android',
  'data-engineering',
  'data-quality',
  'essays',
  'gis',
  'legacy-systems',
  'postgresql',
  'python',
  'reliability',
] as const;

/** More than this reads as keywords, not themes. */
const MAX_TAGS_PER_POST = 4;

const blogCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
    title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }),

    // Short form for the browser tab and search results, where the site name is appended and
    // Google cuts at roughly 60 characters. The full title stays on the page and in the feeds.
    seoTitle: z.string().max(60, { message: 'seoTitle must be at most 60 characters.' }).optional(),

    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters long.' }),

    pubDate: z.coerce.date(),

    // Set when a published post is substantially revised; pubDate stays put.
    updatedDate: z.coerce.date().optional(),

    // Cover under src/assets/blog/, referenced relative to the post file; Astro generates the
    // responsive variants and the metadata (width/height) from it.
    image: image(),

    author: z.string().min(3, { message: 'Author name must be at least 3 characters long.' }),

    draft: z.boolean().optional(),

    tags: z
      .array(z.enum(TAGS))
      .nonempty({ message: 'Tags must contain at least one tag.' })
      .max(MAX_TAGS_PER_POST, { message: `Use at most ${MAX_TAGS_PER_POST} tags; keywords belong in the text.` }),

    headings: z.array(
      z.object({
        depth: z.number(),
        slug: z.string(),
        text: z.string(),
      })
    ).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
