/**
 * Data for the dashboard Share tab: one card per published EN note, paired with
 * its ES translation through the shared selfHealing code.
 */

export const SITE_URL = 'https://www.giorgiosaud.io'

export interface ShareNoteInput {
  title: string
  selfHealing: string
  publishDate: Date
  linkedinCopy?: string
  twitterCopy?: string
  linkedin?: string
  twitter?: string
}

export interface ShareVariant {
  title: string
  url: string
  linkedinCopy?: string
  twitterCopy?: string
  linkedin?: string
  twitter?: string
}

export interface ShareCard {
  selfHealing: string
  /** ISO date, so the array serializes cleanly into the island props. */
  publishDate: string
  en: ShareVariant
  es: ShareVariant | null
}

export type ShareFilter = 'unshared' | 'needsCopy' | 'all'

function variant(note: ShareNoteInput, path: string): ShareVariant {
  return {
    title: note.title,
    url: `${SITE_URL}${path}/${note.selfHealing}`,
    linkedinCopy: note.linkedinCopy?.trim() || undefined,
    twitterCopy: note.twitterCopy?.trim() || undefined,
    linkedin: note.linkedin,
    twitter: note.twitter,
  }
}

export function buildShareCards(
  enNotes: ShareNoteInput[],
  esNotes: ShareNoteInput[],
): ShareCard[] {
  const esByCode = new Map(
    esNotes.map(n => [
      n.selfHealing,
      n,
    ]),
  )
  return [
    ...enNotes,
  ]
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
    .map(en => {
      const es = esByCode.get(en.selfHealing)
      return {
        selfHealing: en.selfHealing,
        publishDate: en.publishDate.toISOString(),
        en: variant(en, '/notebook'),
        es: es ? variant(es, '/es/cuaderno') : null,
      }
    })
}

function variants(card: ShareCard): ShareVariant[] {
  return card.es
    ? [
        card.en,
        card.es,
      ]
    : [
        card.en,
      ]
}

/** Shared = every language version has been posted on LinkedIn or X. */
export function isShared(card: ShareCard): boolean {
  return variants(card).every(v => Boolean(v.linkedin || v.twitter))
}

/** Needs copy = some language version is missing its LinkedIn or X text. */
export function needsCopy(card: ShareCard): boolean {
  return variants(card).some(v => !v.linkedinCopy || !v.twitterCopy)
}

export function filterShareCards(
  cards: ShareCard[],
  filter: ShareFilter,
): ShareCard[] {
  if (filter === 'unshared') return cards.filter(c => !isShared(c))
  if (filter === 'needsCopy') return cards.filter(needsCopy)
  return cards
}

export const SHARE_PAGE_SIZE = 12

export function parseShareFilter(value: string | null): ShareFilter {
  return value === 'needsCopy' || value === 'all' ? value : 'unshared'
}

/** Clamps the requested page into range; returns the slice and page info. */
export function paginateShareCards(
  cards: ShareCard[],
  requestedPage: number,
  pageSize = SHARE_PAGE_SIZE,
): {
  items: ShareCard[]
  page: number
  totalPages: number
} {
  const totalPages = Math.max(1, Math.ceil(cards.length / pageSize))
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, Math.floor(requestedPage)), totalPages)
    : 1
  return {
    items: cards.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
  }
}
