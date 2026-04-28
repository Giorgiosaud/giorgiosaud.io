import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}))

import { getCollection } from 'astro:content'
import {
  getBadges,
  getPublishedNotes,
  getPublishedPortfolio,
  isDraftInDevMode,
} from '@helpers/collections'

const mockGetCollection = vi.mocked(getCollection)

function makeNoteEntry(overrides: { draft?: boolean; publishDate?: Date } = {}) {
  return {
    id: 'test-note',
    data: {
      draft: false,
      publishDate: new Date('2025-01-01'),
      title: 'Test Note',
      selfHealing: 'tstnt1',
      author: 'giorgio-saud',
      collections: [],
      tags: [],
      category: 'development',
      ...overrides,
    },
  }
}

function makeBadgeEntry(overrides: { date?: Date } = {}) {
  return {
    id: 'test-badge',
    data: {
      date: new Date('2025-01-01'),
      title: 'Test Badge',
      ...overrides,
    },
  }
}

describe('isDraftInDevMode', () => {
  it('returns true when DEV=true and draft=true', () => {
    import.meta.env.DEV = true
    expect(isDraftInDevMode({ draft: true })).toBe(true)
  })

  it('returns false when DEV=true and draft=false', () => {
    import.meta.env.DEV = true
    expect(isDraftInDevMode({ draft: false })).toBe(false)
  })

  it('returns false when DEV=false and draft=true', () => {
    import.meta.env.DEV = false
    expect(isDraftInDevMode({ draft: true })).toBe(false)
  })

  it('returns false when DEV=false and draft=false', () => {
    import.meta.env.DEV = false
    expect(isDraftInDevMode({ draft: false })).toBe(false)
  })

  it('returns false when DEV=false and draft=undefined', () => {
    import.meta.env.DEV = false
    expect(isDraftInDevMode({})).toBe(false)
  })
})

describe('getPublishedNotes', () => {
  beforeEach(() => {
    mockGetCollection.mockReset()
  })

  it('calls notes collection for lang=en', async () => {
    mockGetCollection.mockResolvedValue([])
    await getPublishedNotes('en')
    expect(mockGetCollection).toHaveBeenCalledWith('notes', expect.any(Function))
  })

  it('calls notas collection for lang=es', async () => {
    mockGetCollection.mockResolvedValue([])
    await getPublishedNotes('es')
    expect(mockGetCollection).toHaveBeenCalledWith('notas', expect.any(Function))
  })

  it('includes draft entries in DEV mode', async () => {
    import.meta.env.DEV = true
    const draft = makeNoteEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      return filter === undefined || (filter as (e: unknown) => boolean)(draft) ? [draft] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(1)
  })

  it('excludes draft entries in production', async () => {
    import.meta.env.DEV = false
    const draft = makeNoteEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      const pass = (filter as (e: unknown) => boolean)(draft)
      return pass ? [draft] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(0)
  })

  it('excludes future-dated entries in production', async () => {
    import.meta.env.DEV = false
    const future = makeNoteEntry({ publishDate: new Date(Date.now() + 86400000) })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      const pass = (filter as (e: unknown) => boolean)(future)
      return pass ? [future] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(0)
  })

  it('sorts entries newest first', async () => {
    const older = makeNoteEntry({ publishDate: new Date('2024-01-01') })
    const newer = makeNoteEntry({ publishDate: new Date('2025-06-01') })
    mockGetCollection.mockResolvedValue([older, newer])
    const result = await getPublishedNotes('en')
    expect(result[0].data.publishDate.valueOf()).toBeGreaterThan(result[1].data.publishDate.valueOf())
  })
})

describe('getPublishedPortfolio', () => {
  beforeEach(() => {
    mockGetCollection.mockReset()
  })

  it('calls portfolio collection for lang=en', async () => {
    mockGetCollection.mockResolvedValue([])
    await getPublishedPortfolio('en')
    expect(mockGetCollection).toHaveBeenCalledWith('portfolio', expect.any(Function))
  })

  it('calls portafolio collection for lang=es', async () => {
    mockGetCollection.mockResolvedValue([])
    await getPublishedPortfolio('es')
    expect(mockGetCollection).toHaveBeenCalledWith('portafolio', expect.any(Function))
  })

  it('excludes draft entries in production', async () => {
    import.meta.env.DEV = false
    const draft = makeNoteEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      const pass = (filter as (e: unknown) => boolean)(draft)
      return pass ? [draft] : []
    })
    const result = await getPublishedPortfolio('en')
    expect(result).toHaveLength(0)
  })

  it('sorts entries newest first', async () => {
    const older = makeNoteEntry({ publishDate: new Date('2024-01-01') })
    const newer = makeNoteEntry({ publishDate: new Date('2025-06-01') })
    mockGetCollection.mockResolvedValue([older, newer])
    const result = await getPublishedPortfolio('en')
    expect(result[0].data.publishDate.valueOf()).toBeGreaterThan(result[1].data.publishDate.valueOf())
  })
})

describe('getBadges', () => {
  beforeEach(() => {
    mockGetCollection.mockReset()
  })

  it('calls badges collection for lang=en', async () => {
    mockGetCollection.mockResolvedValue([])
    await getBadges('en')
    expect(mockGetCollection).toHaveBeenCalledWith('badges')
  })

  it('calls insignias collection for lang=es', async () => {
    mockGetCollection.mockResolvedValue([])
    await getBadges('es')
    expect(mockGetCollection).toHaveBeenCalledWith('insignias')
  })

  it('sorts by data.date newest first', async () => {
    const older = makeBadgeEntry({ date: new Date('2024-01-01') })
    const newer = makeBadgeEntry({ date: new Date('2025-06-01') })
    mockGetCollection.mockResolvedValue([older, newer])
    const result = await getBadges('en')
    expect(result[0].data.date.valueOf()).toBeGreaterThan(result[1].data.date.valueOf())
  })
})
