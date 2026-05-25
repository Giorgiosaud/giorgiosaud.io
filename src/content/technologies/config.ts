import { defineCollection } from 'astro:content'
import { file } from 'astro/loaders'
import { z } from 'astro/zod'

export const technologies = defineCollection({
  loader: file('src/content/technologies/technologies.json'),
  schema: z.object({
    id: z.string(),
    techs: z.array(z.string()),
  }),
})
