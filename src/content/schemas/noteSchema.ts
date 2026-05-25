import { reference, z } from 'astro:content'
import { SELF_HEALING_REGEX } from '@config/constants'

export const noteSchema = ({ image }: { image: () => z.ZodType }) =>
  z.object({
    draft: z.boolean({
      error: issue =>
        issue.input === undefined
          ? 'Draft is required'
          : 'Value must be true or false',
    }),
    title: z.string(),
    resume: z.string().optional(),
    description: z.string().optional(),
    starred: z.boolean().optional(),
    selfHealing: z.string().regex(SELF_HEALING_REGEX).length(6),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    publishDate: z.date(),
    lastUpdate: z.date().optional(),
    author: reference('team'),
    category: z.string(),
    collections: z.array(reference('collections')),
    tags: z.array(z.string()),
  })
