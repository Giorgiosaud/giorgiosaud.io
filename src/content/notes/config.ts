import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

export const notes = defineCollection({
  loader: glob({
    pattern: '**\/[^_]*.(md|mdx)',
    base: './src/content/notes/en',
  }),
  schema: z.object({
    draft: z.boolean({
      required_error: 'draft is required',
    }),
    title: z.string(),
    resume: z.string(),
    starred: z.boolean().optional(),
    selfHealing: z
      .string()
      .regex(/^[^aeiouAEIOU-]{6}$/)
      .length(6),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
    author: reference('team'),
    category: z.string(),
    collections: z.array(reference('collections')),
    tags: z.array(z.string()),
  }),
})

export const notas = defineCollection({
  loader: glob({
    pattern: '**\/[^_]*.(md|mdx)',
    base: './src/content/notes/es',
  }),
  schema: z.object({
    draft: z.boolean({
      required_error: 'draft is required',
    }),
    title: z.string(),
    resume: z.string(),
    starred: z.boolean().optional(),
    selfHealing: z
      .string()
      .regex(/^[^aeiouAEIOU-]{6}$/)
      .length(6),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform((str) => new Date(str)),
    author: reference('equipo'),
    category: z.string(),
    collections: z.array(reference('colecciones')),
    tags: z.array(z.string()),
  }),
})
export default {
  notas,
  notes,
}
