import { describe, expect, it } from 'vitest'
import {
  buildShareCards,
  filterShareCards,
  isShared,
  needsCopy,
  paginateShareCards,
  parseShareFilter,
  type ShareNoteInput,
} from '../../../src/helpers/share'

const note = (
  selfHealing: string,
  date: string,
  extra: Partial<ShareNoteInput> = {},
): ShareNoteInput => ({
  title: `Note ${selfHealing}`,
  selfHealing,
  publishDate: new Date(date),
  ...extra,
})

const full = { linkedinCopy: 'li', twitterCopy: 'tw' }

describe('buildShareCards', () => {
  it('pairs EN and ES by selfHealing, newest first, with selfHealing URLs', () => {
    const cards = buildShareCards(
      [note('aaaaaa', '2026-01-01'), note('bbbbbb', '2026-02-01')],
      [note('aaaaaa', '2026-01-01', { title: 'Nota' })],
    )
    expect(cards.map(c => c.selfHealing)).toEqual(['bbbbbb', 'aaaaaa'])
    expect(cards[1].en.url).toBe('https://www.giorgiosaud.io/notebook/aaaaaa')
    expect(cards[1].es?.url).toBe(
      'https://www.giorgiosaud.io/es/cuaderno/aaaaaa',
    )
    expect(cards[1].es?.title).toBe('Nota')
    expect(cards[0].es).toBeNull()
    expect(cards[0].publishDate).toBe('2026-02-01T00:00:00.000Z')
  })

  it('treats blank copy as missing', () => {
    const [card] = buildShareCards(
      [note('aaaaaa', '2026-01-01', { linkedinCopy: '  ', twitterCopy: 'tw' })],
      [],
    )
    expect(card.en.linkedinCopy).toBeUndefined()
  })
})

describe('isShared / needsCopy', () => {
  it('is shared only when every language version has a post URL', () => {
    const [enOnly] = buildShareCards(
      [note('aaaaaa', '2026-01-01', { linkedin: 'https://linkedin.com/x' })],
      [note('aaaaaa', '2026-01-01')],
    )
    expect(isShared(enOnly)).toBe(false)

    const [both] = buildShareCards(
      [note('aaaaaa', '2026-01-01', { linkedin: 'https://linkedin.com/x' })],
      [note('aaaaaa', '2026-01-01', { twitter: 'https://x.com/y' })],
    )
    expect(isShared(both)).toBe(true)
  })

  it('needs copy when any language version lacks LinkedIn or X text', () => {
    const [complete] = buildShareCards(
      [note('aaaaaa', '2026-01-01', full)],
      [note('aaaaaa', '2026-01-01', full)],
    )
    expect(needsCopy(complete)).toBe(false)

    const [esMissing] = buildShareCards(
      [note('aaaaaa', '2026-01-01', full)],
      [note('aaaaaa', '2026-01-01', { linkedinCopy: 'li' })],
    )
    expect(needsCopy(esMissing)).toBe(true)
  })
})

describe('filterShareCards', () => {
  const cards = buildShareCards(
    [
      note('aaaaaa', '2026-01-01', { ...full, linkedin: 'https://l.in/a' }),
      note('bbbbbb', '2026-01-02', full),
      note('cccccc', '2026-01-03'),
    ],
    [],
  )

  it('filters by unshared, needs copy and all', () => {
    const ids = (f: Parameters<typeof filterShareCards>[1]) =>
      filterShareCards(cards, f).map(c => c.selfHealing)
    expect(ids('unshared')).toEqual(['cccccc', 'bbbbbb'])
    expect(ids('needsCopy')).toEqual(['cccccc'])
    expect(ids('all')).toEqual(['cccccc', 'bbbbbb', 'aaaaaa'])
  })

  it('defaults unknown filter params to unshared', () => {
    expect(parseShareFilter(null)).toBe('unshared')
    expect(parseShareFilter('nope')).toBe('unshared')
    expect(parseShareFilter('needsCopy')).toBe('needsCopy')
  })
})

describe('paginateShareCards', () => {
  const cards = buildShareCards(
    Array.from({ length: 5 }, (_, i) =>
      note(`p${'bcdfg'[i]}pppp`, `2026-01-0${i + 1}`),
    ),
    [],
  )

  it('slices pages and clamps out-of-range or invalid pages', () => {
    expect(paginateShareCards(cards, 2, 2)).toMatchObject({
      page: 2,
      totalPages: 3,
    })
    expect(paginateShareCards(cards, 2, 2).items).toHaveLength(2)
    expect(paginateShareCards(cards, 99, 2).page).toBe(3)
    expect(paginateShareCards(cards, Number.NaN, 2).page).toBe(1)
    expect(paginateShareCards([], 1).totalPages).toBe(1)
  })
})
