import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotesList } from '@/context/NotesListContext'
import {
  displayTitle,
  sortedNotes,
  type NotesSortOption,
} from '@/lib/notesListUtils'
import type { NoteResponse } from '@/api/client'

function SidebarNoteLink({ note }: { note: NoteResponse }) {
  return (
    <NavLink
      to={`/notes/${note.id}`}
      className={({ isActive }) =>
        cn('notes-sidebar-note-link', isActive && 'notes-sidebar-note-link--active')
      }
    >
      <span className="notes-sidebar-note-title">{displayTitle(note)}</span>
    </NavLink>
  )
}

export function NotesSidebar() {
  const { notes, error } = useNotesList()
  const [sort, setSort] = useState<NotesSortOption>('updated-desc')

  const sorted = useMemo(
    () => (notes !== null ? sortedNotes(notes, sort) : null),
    [notes, sort],
  )

  return (
    <aside className="notes-sidebar" aria-label="Notes">
      <div className="notes-sidebar-header">
        <div>
          <p className="notes-sidebar-kicker">NotesMD</p>
          <h2 className="notes-sidebar-title">Notes</h2>
        </div>
        <Button asChild size="sm" className="button-with-icon shrink-0">
          <NavLink to="/notes/new">
            <Plus className="icon-sm" aria-hidden />
            New note
          </NavLink>
        </Button>
      </div>

      {error ? (
        <p className="notes-sidebar-error" role="alert">{error}</p>
      ) : null}

      {notes === null && !error ? (
        <p className="notes-sidebar-loading">Loading notes…</p>
      ) : null}

      {notes && notes.length > 0 ? (
        <div className="notes-sidebar-list-wrap">
          <div className="notes-sort-row">
            <label htmlFor="notes-sort" className="notes-sort-label">
              Sort
            </label>
            <select
              id="notes-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as NotesSortOption)}
              className="notes-sort-select"
            >
              <option value="updated-desc">Recently updated</option>
              <option value="updated-asc">Least recently updated</option>
              <option value="created-desc">Newest first (created)</option>
              <option value="created-asc">Oldest first (created)</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>
          </div>
          <ScrollArea className="notes-sidebar-scroll">
            <ul className="notes-sidebar-list">
              {sorted?.map((n) => (
                <li key={n.id}>
                  <SidebarNoteLink note={n} />
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      ) : null}

      {notes && notes.length === 0 && !error ? (
        <p className="notes-sidebar-empty">No notes yet. Create one to get started.</p>
      ) : null}
    </aside>
  )
}
