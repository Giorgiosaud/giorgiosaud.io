import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

export const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.(md|mdx)',
    base: './src/content/notes/en',
  }),
  schema:({image})=> z.object({
    
    draft: z.boolean({
      required_error: 'draft is required',
    }),
    title: z.string(),
    resume: z.string().optional(),
    description: z.string().optional(),
    starred: z.boolean().optional(),
    selfHealing: z
      .string()
      .regex(/^[^aeiouAEIOU-]{6}$/)
      .length(6),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    publishDate: z.date(),
    lastUpdate: z.date().optional(),
    author: reference('team'),
    category: z.string(),
    collections: z.array(reference('collections')),
    tags: z.array(z.string()),
  }),
})

export const notas = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.(md|mdx)',
    base: './src/content/notes/es',
  }),
  schema: ({image})=>z.object({
      draft: z.boolean({
      required_error: 'draft is required',
    }),
    title: z.string(),
    resume: z.string().optional(),
    description: z.string().optional(),
    starred: z.boolean().optional(),
    selfHealing: z
      .string()
      .regex(/^[^aeiouAEIOU-]{6}$/)
      .length(6),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    publishDate: z.date(),
    lastUpdate: z.date().optional(),
    author: reference('team'),
    category: z.string(),
    collections: z.array(reference('collections')),
    tags: z.array(z.string()),
  }),
})
export default {
  notas,
  notes,
}
