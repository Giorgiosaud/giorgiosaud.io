/**
 * Pure search/filter/paginate logic extracted from the API endpoint.
 * Kept free of Astro dependencies so it can be unit-tested with Vitest.
 */
import Fuse from 'fuse.js'

export const SEARCH_PAGE_SIZE = 12

export interface NoteSearchEntry {
  id: string
  data: {
    title: string
    description?: string
    tags?: string[]
    collections?: (
      | {
          id: string
        }
      | string
    )[]
    publishDate: Date
    cover?: {
      src: string
    }
    coverAlt?: string
  }
}

export interface NoteCard {
  id: string
  title: string
  description: string | undefined
  coverSrc: string | undefined
  coverAlt: string | undefined
  href: string
  publishDate: string
  collections: string[]
}

export interface SearchResponse {
  results: NoteCard[]
  total: number
  page: number
  totalPages: number
  query: string
  collection: string | null
}

export interface SearchOptions {
  q?: string
  collection?: string
  page?: number
  lang?: 'en' | 'es'
}

function collectionId(
  c:
    | {
        id: string
      }
    | string,
): string {
  return typeof c === 'string' ? c : c.id
}

export function runSearch(
  allNotes: NoteSearchEntry[],
  options: SearchOptions,
): SearchResponse {
  const q = options.q ?? ''
  const collection = options.collection ?? ''
  const page = Math.max(1, options.page ?? 1)
  const lang = options.lang ?? 'en'

  let searched: NoteSearchEntry[] = allNotes

  if (q.trim().length >= 2) {
    const fuse = new Fuse(allNotes, {
      keys: [
        {
          name: 'data.title',
          weight: 0.6,
        },
        {
          name: 'data.description',
          weight: 0.25,
        },
        {
          name: 'data.tags',
          weight: 0.15,
        },
      ],
      threshold: 0.35,
      includeScore: false,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })
    searched = fuse.search(q).map(r => r.item)
  }

  let filtered = searched
  if (collection) {
    filtered = searched.filter(note =>
      (note.data.collections ?? []).some(c => collectionId(c) === collection),
    )
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * SEARCH_PAGE_SIZE
  const slice = filtered.slice(start, start + SEARCH_PAGE_SIZE)

  const hrefPrefix = lang === 'es' ? '/es/cuaderno' : '/notebook'

  const results: NoteCard[] = slice.map(note => ({
    id: note.id,
    title: note.data.title,
    description: note.data.description,
    coverSrc: note.data.cover?.src,
    coverAlt: note.data.coverAlt,
    href: `${hrefPrefix}/${note.id}`,
    publishDate: note.data.publishDate.toISOString(),
    collections: (note.data.collections ?? []).map(collectionId),
  }))

  return {
    results,
    total,
    page: safePage,
    totalPages,
    query: q,
    collection: collection || null,
  }
}
