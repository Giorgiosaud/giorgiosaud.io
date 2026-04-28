import { describe, expect, it } from 'vitest'
import { getRelatedNotes } from '@helpers/relatedNotes'
import type { RelatedNoteEntry } from '@helpers/relatedNotes'

function makeNote(
  id: string,
  collections: string[] = [],
  publishDate = new Date('2025-01-01'),
): RelatedNoteEntry {
  return {
    id,
    data: {
      collections: collections.map(c => ({ id: c })),
      publishDate,
    },
  }
}

// Scenario 1: Overlap-sorted order is correct
describe('getRelatedNotes — overlap sort order', () => {
  it('returns notes sorted by collection overlap descending', () => {
    const current = makeNote('current', ['testing', 'javascript', 'astro'])
    const highOverlap = makeNote('high', ['testing', 'javascript', 'astro'])
    const medOverlap = makeNote('med', ['testing', 'javascript'])
    const lowOverlap = makeNote('low', ['testing'])
    const result = getRelatedNotes(current, [current, highOverlap, medOverlap, lowOverlap])
    expect(result[0].id).toBe('high')
    expect(result[1].id).toBe('med')
    expect(result[2].id).toBe('low')
  })
})

// Scenario 2: Current note excluded
describe('getRelatedNotes — current note excluded', () => {
  it('never includes the current note in results', () => {
    const current = makeNote('current', ['testing'])
    const other = makeNote('other', ['testing'])

    const result = getRelatedNotes(current, [current, other])
    expect(result.find(n => n.id === 'current')).toBeUndefined()
    expect(result[0].id).toBe('other')
  })
})

// Scenario 3: Fallback pads to 4 when overlap < 4
describe('getRelatedNotes — fallback padding', () => {
  it('pads result to 4 with newest notes when overlap < 4', () => {
    const current = makeNote('current', ['rare'])
    const overlap1 = makeNote('overlap1', ['rare'])
    const fallback1 = makeNote('fallback1', ['css'], new Date('2025-06-01'))
    const fallback2 = makeNote('fallback2', ['css'], new Date('2025-03-01'))
    const fallback3 = makeNote('fallback3', ['css'], new Date('2025-01-01'))

    const result = getRelatedNotes(current, [current, overlap1, fallback1, fallback2, fallback3])
    expect(result).toHaveLength(4)
    expect(result[0].id).toBe('overlap1') // overlap first
    // fallback notes fill remaining slots
    expect(result.slice(1).map(n => n.id)).toContain('fallback1')
  })
})

// Scenario 4: Returns empty array when no overlap and no other notes available
describe('getRelatedNotes — empty result', () => {
  it('returns empty array when no other notes exist', () => {
    const current = makeNote('current', ['unique'])
    const result = getRelatedNotes(current, [current])
    expect(result).toHaveLength(0)
  })
})
