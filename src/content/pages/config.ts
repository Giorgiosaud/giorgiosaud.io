import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

export const pages = defineCollection({
  loader: glob({ base: 'src/content/pages/en', pattern: '*.(md|mdx)' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pathToTranslate: z.string(),
  }),
})

export const paginas = defineCollection({
  loader: glob({ base: 'src/content/pages/es', pattern: '*.(md|mdx)' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pathToTranslate: z.string(),
  }),
})
export default {
  pages,
  paginas,
}
