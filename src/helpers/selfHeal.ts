import { getCollection } from 'astro:content'
import type { AstroGlobal } from 'astro'

/**
 * Handles self-healing URL redirects for notes.
 *
 * When a note's slug changes, old URLs containing the self-healing code
 * will still work by redirecting to the current note URL.
 *
 * Self-healing codes are 6-character consonant-only strings (no vowels, no dashes)
 * embedded in note frontmatter. The code is extracted from the URL path and
 * matched against the notes collection.
 *
 * @param Astro - The Astro global object containing request params
 * @param collectionName - The content collection to search ('notes' for EN, 'notas' for ES)
 * @returns A redirect response if a matching note is found, null otherwise
 *
 * @example
 * // In [selfheal].astro:
 * const redirect = await selfHeal(Astro, 'notes')
 * if (redirect) return redirect
 */
export async function selfHeal(
  Astro: AstroGlobal,
  collectionName: 'notes' | 'notas',
) {
  const notes = await getCollection(collectionName)
  const selfhealPath = Astro.params.selfheal
  const selfHealRegex = /(?<=^|-)[^aeiouAEIOU-]{6}(?=-|$)/g
  const selfHealing = selfhealPath?.match(selfHealRegex) || []

  if (selfHealing.length) {
    for (const sh of selfHealing) {
      const note = notes.find(note => note.data.selfHealing === sh)
      if (note) {
        const basePath =
          collectionName === 'notes' ? '/notebook' : '/es/cuaderno'
        return Astro.redirect(`${basePath}/${note.id}`, 301)
      }
    }
  }
  return null
}
