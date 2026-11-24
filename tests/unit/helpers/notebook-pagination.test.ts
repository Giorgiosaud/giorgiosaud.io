import { describe, expect, it } from 'vitest'
import { paginationWindow } from '../../../src/global/scripts/notebook-search'

describe('paginationWindow', () => {
  it('lists every page when there are few', () => {
    expect(paginationWindow(1, 3)).toEqual([1, 2, 3])
  })

  it('keeps first, last and current ±1, collapsing gaps to one ellipsis', () => {
    expect(paginationWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10])
  })

  it('has no leading ellipsis on the first pages', () => {
    expect(paginationWindow(2, 5)).toEqual([1, 2, 3, null, 5])
  })

  it('has no trailing ellipsis on the last pages', () => {
    expect(paginationWindow(9, 10)).toEqual([1, null, 8, 9, 10])
  })
})
