import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const portfolioSchema = z.object({
  draft: z.boolean(),
  client: z.string(),
  country: z.string(),
  category: z.string(),
  selfHealing: z.string().length(6).optional(),
  workingOn: z.string(),
  project: z.string(),
  resume: z.string(),
  classes: z.string().optional(),
  classesClient: z.string().optional(),
  image: z.object({
    src: z.string(),
    alt: z.string(),
  }),
  publishDate: z.string().transform((str) => new Date(str)),
  technologies: z.array(z.string()),
})

export const portfolio = defineCollection({
  loader: glob({ pattern: '*.(md|mdx)', base: './src/content/portfolio/en' }),
  schema: portfolioSchema,
})

export const portafolio = defineCollection({
  loader: glob({ pattern: '*.(md|mdx)', base: './src/content/portfolio/es' }),
  schema: portfolioSchema,
})

export default {
  portafolio,
  portfolio,
}
