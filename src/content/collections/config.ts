import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const collectionSchema = z.object({
  title: z.string(),
  icon: z.string(),
  description: z.string(),
})

export const collections = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/collections/en',
  }),
  schema: collectionSchema,
})

export const colecciones = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/collections/es',
  }),
  schema: collectionSchema,
})

export default {
  collections,
  colecciones,
}
