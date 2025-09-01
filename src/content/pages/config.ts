import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
  pathToTranslate: z.string(),
})

export const pages = defineCollection({
  loader: glob({
    base: 'src/content/pages/en',
    pattern: '*.(md|mdx)',
  }),
  schema: pageSchema,
})

export const paginas = defineCollection({
  loader: glob({
    base: 'src/content/pages/es',
    pattern: '*.(md|mdx)',
  }),
  schema: pageSchema,
})

export default {
  pages,
  paginas,
}
