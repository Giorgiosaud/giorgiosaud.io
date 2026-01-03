import { reference, z } from 'astro:content'
import { SELF_HEALING_REGEX } from '@config/constants'

/**
 * Shared schema for notes collection (used by both EN and ES versions).
 *
 * Features:
 * - Self-healing URLs via 6-char consonant-only codes
 * - Type-safe author and collections references
 * - Image handling with Astro's image() helper
 */
export const noteSchema = ({
  image,
}: {
  image: () => ReturnType<typeof z.custom>
}) =>
  z.object({
    draft: z.boolean({
      required_error: 'draft is required',
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
