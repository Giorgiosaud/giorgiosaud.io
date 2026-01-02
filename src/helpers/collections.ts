import { getCollection, type CollectionEntry } from 'astro:content'
import type { SupportedLanguages } from '@i18n/utils'
import { PAGINATION_SIZE } from '@config/constants'

/**
 * Get published notes for a given language.
 *
 * In development mode, returns all notes including drafts.
 * In production, filters out drafts and future-dated posts.
 *
 * @param lang - The language code ('en' or 'es')
 * @returns Sorted array of notes (newest first)
 */
export async function getPublishedNotes(
  lang: SupportedLanguages,
): Promise<CollectionEntry<'notes' | 'notas'>[]> {
  const collectionName = lang === 'es' ? 'notas' : 'notes'

  const entries = await getCollection(collectionName, ({ data }) => {
    // In dev mode, show all posts including drafts
    if (import.meta.env.DEV) return true
    // In production, filter drafts and future posts
    return !data.draft && data.publishDate < new Date()
  })

  // Sort by publish date, newest first
  return entries.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  )
}

/**
 * Get published portfolio entries for a given language.
 *
 * In development mode, returns all entries including drafts.
 * In production, filters out drafts.
 *
 * @param lang - The language code ('en' or 'es')
 * @returns Sorted array of portfolio entries (newest first)
 */
export async function getPublishedPortfolio(
  lang: SupportedLanguages,
): Promise<CollectionEntry<'portfolio' | 'portafolio'>[]> {
  const collectionName = lang === 'es' ? 'portafolio' : 'portfolio'

  const entries = await getCollection(collectionName, ({ data }) => {
    // In dev mode, show all entries including drafts
    if (import.meta.env.DEV) return true
    // In production, filter drafts
    return !data.draft
  })

  // Sort by publish date, newest first
  return entries.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  )
}

/**
 * Get all badges for a given language.
 *
 * @param lang - The language code ('en' or 'es')
 * @returns Sorted array of badges (newest first)
 */
export async function getBadges(
  lang: SupportedLanguages,
): Promise<CollectionEntry<'badges' | 'insignias'>[]> {
  const collectionName = lang === 'es' ? 'insignias' : 'badges'
  const entries = await getCollection(collectionName)

  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/**
 * Check if the current entry is a draft (for visual indicators in dev mode).
 *
 * @param data - The entry data object
 * @returns Whether this is a draft and we're in dev mode
 */
export function isDraftInDevMode(data: { draft?: boolean }): boolean {
  return import.meta.env.DEV && data.draft === true
}

/**
 * Pagination configuration.
 */
export { PAGINATION_SIZE }
