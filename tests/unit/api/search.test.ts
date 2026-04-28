import { describe, expect, it } from 'vitest'
import { runSearch, SEARCH_PAGE_SIZE } from '@helpers/search'
import type { NoteSearchEntry } from '@helpers/search'

function makeNote(
  id: string,
  overrides: Partial<NoteSearchEntry['data']> = {},
): NoteSearchEntry {
  return {
    id,
    data: {
      title: `Note ${id}`,
      description: `Description for ${id}`,
      tags: [],
      collections: [],
      publishDate: new Date('2025-01-01'),
      ...overrides,
    },
  }
}

// Scenario 1: Empty q returns all notes paginated
describe('runSearch — empty query', () => {
  it('returns all notes when q is empty', () => {
    const notes = Array.from({ length: 15 }, (_, i) => makeNote(`note-${i}`))
    const result = runSearch(notes, { q: '', lang: 'en' })
    expect(result.total).toBe(15)
    expect(result.results).toHaveLength(SEARCH_PAGE_SIZE) // 12
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(2)
  })
})

// Scenario 2: Non-empty q returns fuzzy-matched subset
describe('runSearch — keyword search', () => {
  it('returns fuzzy-matched notes when q is provided', () => {
    const notes = [
      makeNote('vitest-intro', { title: 'Introduction to Vitest', tags: ['testing'] }),
      makeNote('bun-guide', { title: 'Bun Runtime Guide', tags: ['runtime'] }),
      makeNote('astro-tips', { title: 'Astro Tips', tags: ['framework'] }),
    ]
    const result = runSearch(notes, { q: 'vitest', lang: 'en' })
    expect(result.results.length).toBeGreaterThan(0)
    expect(result.results[0].id).toBe('vitest-intro')
    expect(result.total).toBeGreaterThan(0)
  })
})

// Scenario 3: collection filter narrows results
describe('runSearch — collection filter', () => {
  it('filters results to notes in the given collection', () => {
    const notes = [
      makeNote('test-note', { collections: [{ id: 'testing' }] }),
      makeNote('other-note', { collections: [{ id: 'javascript' }] }),
      makeNote('another-test', { collections: [{ id: 'testing' }, { id: 'javascript' }] }),
    ]
    const result = runSearch(notes, { q: '', collection: 'testing', lang: 'en' })
    expect(result.total).toBe(2)
    expect(result.results.every(r => r.collections.includes('testing'))).toBe(true)
  })
})

// Scenario 4: Combined q + collection applies both filters
describe('runSearch — combined q and collection', () => {
  it('applies both keyword and collection filters', () => {
    const notes = [
      makeNote('vitest-testing', { title: 'Vitest Deep Dive', collections: [{ id: 'testing' }] }),
      makeNote('vitest-other', { title: 'Vitest Overview' }),
      makeNote('bun-testing', { title: 'Bun for Testing', collections: [{ id: 'testing' }] }),
    ]
    const result = runSearch(notes, { q: 'vitest', collection: 'testing', lang: 'en' })
    expect(result.results.length).toBeGreaterThan(0)
    expect(result.results.every(r => r.collections.includes('testing'))).toBe(true)
  })
})

// Scenario 5: page=2 returns correct slice
describe('runSearch — pagination', () => {
  it('returns items for page 2 correctly', () => {
    const notes = Array.from({ length: 25 }, (_, i) =>
      makeNote(`note-${i}`, { title: `Bun note ${i}` }),
    )
    // q matches all "Bun note" titles
    const result = runSearch(notes, { q: 'Bun', lang: 'en', page: 2 })
    expect(result.page).toBe(2)
    expect(result.total).toBeGreaterThan(SEARCH_PAGE_SIZE)
    // page 2 has remaining items
    expect(result.results.length).toBeGreaterThan(0)
  })
})

// Scenario 6: lang=es generates ES hrefs
describe('runSearch — lang=es', () => {
  it('generates /es/cuaderno hrefs for ES notes', () => {
    const notes = [makeNote('mi-nota')]
    const result = runSearch(notes, { q: '', lang: 'es' })
    expect(result.results[0].href).toMatch(/^\/es\/cuaderno\//)
  })

  it('generates /notebook hrefs for EN notes', () => {
    const notes = [makeNote('my-note')]
    const result = runSearch(notes, { q: '', lang: 'en' })
    expect(result.results[0].href).toMatch(/^\/notebook\//)
  })
})
