import type { NoteResponse } from '@/api/client'

export type NotesSortOption =
  | 'updated-desc'
  | 'updated-asc'
  | 'created-desc'
  | 'created-asc'
  | 'title-asc'
  | 'title-desc'

/** Sort keys for the archive sidebar list (primary sort uses archivedAt) */
export type ArchivedNotesSortOption =
  | 'archived-desc'
  | 'archived-asc'
  | 'title-asc'
  | 'title-desc'

function cmpIso(a: string, b: string): number {
  return a.localeCompare(b)
}

export function displayTitle(note: NoteResponse): string {
  const t = note.title.trim()
  return t.length > 0 ? t : 'Untitled'
}

export function sortedNotes(items: NoteResponse[], sort: NotesSortOption): NoteResponse[] {
  const copy = [...items]
  switch (sort) {
    case 'updated-desc':
      return copy.sort((a, b) => -cmpIso(a.updatedAt, b.updatedAt))
    case 'updated-asc':
      return copy.sort((a, b) => cmpIso(a.updatedAt, b.updatedAt))
    case 'created-desc':
      return copy.sort((a, b) => -cmpIso(a.createdAt, b.createdAt))
    case 'created-asc':
      return copy.sort((a, b) => cmpIso(a.createdAt, b.createdAt))
    case 'title-asc':
      return copy.sort((a, b) =>
        displayTitle(a).localeCompare(displayTitle(b), undefined, { sensitivity: 'base' }),
      )
    case 'title-desc':
      return copy.sort((a, b) =>
        displayTitle(b).localeCompare(displayTitle(a), undefined, { sensitivity: 'base' }),
      )
    default:
      return copy
  }
}

export function sortedArchivedNotes(
  items: NoteResponse[],
  sort: ArchivedNotesSortOption,
): NoteResponse[] {
  const copy = [...items]
  switch (sort) {
    case 'archived-desc':
      return copy.sort((a, b) => -cmpIso(a.archivedAt ?? '', b.archivedAt ?? ''))
    case 'archived-asc':
      return copy.sort((a, b) => cmpIso(a.archivedAt ?? '', b.archivedAt ?? ''))
    case 'title-asc':
      return copy.sort((a, b) =>
        displayTitle(a).localeCompare(displayTitle(b), undefined, { sensitivity: 'base' }),
      )
    case 'title-desc':
      return copy.sort((a, b) =>
        displayTitle(b).localeCompare(displayTitle(a), undefined, { sensitivity: 'base' }),
      )
    default:
      return copy
  }
}
