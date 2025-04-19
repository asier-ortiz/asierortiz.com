import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string().min(5, { message: 'Title must be at least 5 characters long.' }),

    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters long.' }),

    pubDate: z.coerce.date(),

    image: z.string().startsWith('/', { message: "Image path must start with '/'." }),

    author: z.string().min(3, { message: 'Author name must be at least 3 characters long.' }),

    draft: z.boolean().optional(),

    tags: z
      .array(z.string())
      .nonempty({ message: 'Tags must contain at least one tag.' })
      .optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
