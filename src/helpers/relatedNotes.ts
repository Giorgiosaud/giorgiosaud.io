/**
 * Pure related-posts algorithm extracted for testability.
 */

export interface RelatedNoteEntry {
  id: string
  data: {
    collections?: (
      | {
          id: string
        }
      | string
    )[]
    publishDate: Date
  }
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

/**
 * Returns up to 4 related notes for `currentNote` from `allNotes`.
 * Sorted by collection overlap (desc) then publishDate (desc).
 * If fewer than 4 overlap matches, pads with newest non-self notes.
 */
export function getRelatedNotes<T extends RelatedNoteEntry>(
  currentNote: T,
  allNotes: T[],
  max = 4,
): T[] {
  const currentCollectionIds = (currentNote.data.collections ?? []).map(
    collectionId,
  )

  const withOverlap = allNotes
    .filter(n => n.id !== currentNote.id)
    .map(n => ({
      note: n,
      overlap: (n.data.collections ?? []).filter(c =>
        currentCollectionIds.includes(collectionId(c)),
      ).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        b.note.data.publishDate.valueOf() - a.note.data.publishDate.valueOf(),
    )
    .map(({ note }) => note)

  const fallback = allNotes.filter(
    n => n.id !== currentNote.id && !withOverlap.includes(n),
  )

  return [
    ...withOverlap,
    ...fallback,
  ].slice(0, max)
}
