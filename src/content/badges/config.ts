import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const badgeSchema = z.object({
  slug: z.string(),
  title: z.string(),
  imgSrc: z.string(),
  description: z.string(),
  cardColor: z.string(),
  category: z.string(),
  date: z.date(),
  poweredBy: z.string(),
})

export const badges = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/badges/en' }),
  schema: badgeSchema,
})

export const insignias = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/badges/es' }),
  schema: badgeSchema,
})

export default {
  badges,
  insignias,
}
