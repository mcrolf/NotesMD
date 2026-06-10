import { NavLink } from 'react-router-dom'
import { Archive, FileText, Plus, PanelLeft } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotesList } from '@/context/NotesListContext'
import {
  displayTitle,
  sortedArchivedNotes,
  sortedNotes,
  type ArchivedNotesSortOption,
  type NotesSortOption,
} from '@/lib/notesListUtils'
import type { NoteResponse } from '@/api/client'

type SidebarView = 'active' | 'archive'

function SidebarNoteLink({ note }: { note: NoteResponse }) {
  return (
    <NavLink
      to={`/notes/${note.id}`}
      className={({ isActive }) =>
        cn('notes-sidebar-note-link', isActive && 'notes-sidebar-note-link--active')
      }
    >
      <span className="notes-sidebar-note-title text-center">{displayTitle(note)}</span>
    </NavLink>
  )
}

// Icon-only note chip for the collapsed sidebar rail
function SidebarNoteLinkCollapsed({ note }: { note: NoteResponse }) {
  const title = displayTitle(note)

  return (
    <NavLink
      to={`/notes/${note.id}`}
      title={title}
      aria-label={title}
      className={({ isActive }) =>
        cn(
          'notes-sidebar-note-link notes-sidebar-note-link--collapsed',
          isActive && 'notes-sidebar-note-link--active',
        )
      }
    >
      <span className="notes-sidebar-note-initial" aria-hidden>
        {title.charAt(0).toUpperCase()}
      </span>
    </NavLink>
  )
}

type SidebarViewTabsProps = {
  view: SidebarView
  onViewChange: (view: SidebarView) => void
  collapsed?: boolean
}

// Segmented control switching between active notes and the archive list
function SidebarViewTabs({ view, onViewChange, collapsed = false }: SidebarViewTabsProps) {
  if (collapsed) {
    return (
      <div
        className="notes-sidebar-view-tabs notes-sidebar-view-tabs--collapsed"
        role="tablist"
        aria-label="Notes or archive"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === 'active'}
          aria-label="Notes"
          className={cn(
            'notes-sidebar-view-tab notes-sidebar-view-tab--collapsed',
            view === 'active' && 'notes-sidebar-view-tab--active',
          )}
          onClick={() => onViewChange('active')}
        >
          <FileText className="icon-sm" aria-hidden/>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'archive'}
          aria-label="Archive"
          className={cn(
            'notes-sidebar-view-tab notes-sidebar-view-tab--collapsed',
            view === 'archive' && 'notes-sidebar-view-tab--active',
          )}
          onClick={() => onViewChange('archive')}
        >
          <Archive className="icon-sm" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <div className="notes-sidebar-view-tabs" role="tablist" aria-label="Notes or archive">
      <button
        type="button"
        role="tab"
        aria-selected={view === 'active'}
        className={cn(
          'notes-sidebar-view-tab',
          view === 'active' && 'notes-sidebar-view-tab--active',
        )}
        onClick={() => onViewChange('active')}
      >
        Notes
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'archive'}
        className={cn(
          'notes-sidebar-view-tab',
          view === 'archive' && 'notes-sidebar-view-tab--active',
        )}
        onClick={() => onViewChange('archive')}
      >
        Archive
      </button>
    </div>
  )
}

type SidebarNotesProps = {
  notes: NoteResponse[] | null
  sorted: NoteResponse[] | null
  error: string | null
  view: SidebarView
  onViewChange: (view: SidebarView) => void
  loadingMessage: string
  emptyMessage: string
}

type SidebarExpandedProps = SidebarNotesProps & {
  onCollapse: () => void
  isArchiveView: boolean
  activeSort: NotesSortOption
  onActiveSortChange: (sort: NotesSortOption) => void
  archiveSort: ArchivedNotesSortOption
  onArchiveSortChange: (sort: ArchivedNotesSortOption) => void
}

// Full sidebar: branding, sort controls, and titled note list (collapsed=false)
function NotesSidebarExpanded({
  notes,
  sorted,
  error,
  view,
  onViewChange,
  loadingMessage,
  emptyMessage,
  onCollapse,
  isArchiveView,
  activeSort,
  onActiveSortChange,
  archiveSort,
  onArchiveSortChange,
}: SidebarExpandedProps) {
  const sortId = isArchiveView ? 'notes-archive-sort' : 'notes-sort'

  return (
    <>
      <div className="notes-sidebar-header">
        <div className="notes-sidebar-header-actions">
          <Button asChild size="sm" className="button-with-icon shrink-0" aria-label="New note">
            <NavLink to="/notes/new">
              <Plus className="icon-sm" aria-hidden />
              New note
            </NavLink>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="button-with-icon shrink-0"
            aria-label="Collapse sidebar"
            onClick={onCollapse}
          >
            <PanelLeft className="icon-sm" aria-hidden />
          </Button>
        </div>
        <SidebarViewTabs view={view} onViewChange={onViewChange} />
      </div>

      {error ? (
        <p className="notes-sidebar-error" role="alert">{error}</p>
      ) : null}

      {notes === null && !error ? (
        <p className="notes-sidebar-loading">{loadingMessage}</p>
      ) : null}

      {notes && notes.length > 0 ? (
        <div className="notes-sidebar-list-wrap">
          <div className="notes-sort-row">
            <label htmlFor={sortId} className="notes-sort-label">
              Sort
            </label>
            {isArchiveView ? (
              <select
                id={sortId}
                value={archiveSort}
                onChange={(e) =>
                  onArchiveSortChange(e.target.value as ArchivedNotesSortOption)
                }
                className="notes-sort-select"
              >
                <option value="archived-desc">Recently archived</option>
                <option value="archived-asc">Oldest archived</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            ) : (
              <select
                id={sortId}
                value={activeSort}
                onChange={(e) => onActiveSortChange(e.target.value as NotesSortOption)}
                className="notes-sort-select"
              >
                <option value="updated-desc">Recently updated</option>
                <option value="updated-asc">Least recently updated</option>
                <option value="created-desc">Newest first (created)</option>
                <option value="created-asc">Oldest first (created)</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            )}
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
        <p className="notes-sidebar-empty">{emptyMessage}</p>
      ) : null}
    </>
  )
}

// Narrow icon rail with expand control and note initials (collapsed=true)
function NotesSidebarCollapsed({
  notes,
  sorted,
  error,
  view,
  onViewChange,
  loadingMessage,
  emptyMessage,
  onExpand,
}: SidebarNotesProps & { onExpand: () => void }) {
  return (
    <>
      <div className="notes-sidebar-header notes-sidebar-header--collapsed">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Expand sidebar"
          onClick={onExpand}
        >
          <PanelLeft className="icon-sm rotate-180" aria-hidden />
        </Button>
        <Button asChild size="icon-sm" aria-label="New note">
          <NavLink to="/notes/new">
            <Plus className="icon-sm" aria-hidden />
          </NavLink>
        </Button>
        <SidebarViewTabs view={view} onViewChange={onViewChange} collapsed />
      </div>

      {error ? (
        <p className="notes-sidebar-error notes-sidebar-error--collapsed" role="alert">
          !
        </p>
      ) : null}

      {notes === null && !error ? (
        <p
          className="notes-sidebar-loading notes-sidebar-loading--collapsed"
          aria-live="polite"
          aria-label={loadingMessage}
        >
          …
        </p>
      ) : null}

      {notes && notes.length > 0 ? (
        <ScrollArea className="notes-sidebar-scroll notes-sidebar-scroll--collapsed">
          <ul className="notes-sidebar-list notes-sidebar-list--collapsed">
            {sorted?.map((n) => (
              <li key={n.id}>
                <SidebarNoteLinkCollapsed note={n} />
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : null}

      {notes && notes.length === 0 && !error ? (
        <p
          className="notes-sidebar-empty notes-sidebar-empty--collapsed"
          aria-label={emptyMessage}
        >
          —
        </p>
      ) : null}
    </>
  )
}

export function NotesSidebar() {
  const {
    notes,
    error,
    archivedNotes,
    archivedError,
    refreshArchivedNotes,
  } = useNotesList()
  const [view, setView] = useState<SidebarView>('active')
  const [sort, setSort] = useState<NotesSortOption>('updated-desc')
  const [archiveSort, setArchiveSort] = useState<ArchivedNotesSortOption>('archived-desc')
  const [collapsed, setCollapsed] = useState(false)

  const isArchiveView = view === 'archive'
  const displayNotes = isArchiveView ? archivedNotes : notes
  const displayError = isArchiveView ? archivedError : error

  // Lazy-fetch archived notes the first time the user opens the Archive tab
  const handleViewChange = useCallback(
    (next: SidebarView) => {
      setView(next)
      if (next === 'archive' && archivedNotes === null && archivedError === null) {
        void refreshArchivedNotes()
      }
    },
    [archivedNotes, archivedError, refreshArchivedNotes],
  )

  const sorted = useMemo(() => {
    if (displayNotes === null) return null
    return isArchiveView
      ? sortedArchivedNotes(displayNotes, archiveSort)
      : sortedNotes(displayNotes, sort)
  }, [displayNotes, isArchiveView, archiveSort, sort])

  const loadingMessage = isArchiveView ? 'Loading archived notes…' : 'Loading notes…'
  const emptyMessage = isArchiveView
    ? 'No archived notes.'
    : 'No notes yet. Create one to get started.'

  const sharedProps: SidebarNotesProps = {
    notes: displayNotes,
    sorted,
    error: displayError,
    view,
    onViewChange: handleViewChange,
    loadingMessage,
    emptyMessage,
  }

  return (
    <aside
      className={cn('notes-sidebar', collapsed && 'notes-sidebar--collapsed')}
      aria-label={isArchiveView ? 'Archived notes' : 'Notes'}
      data-collapsed={collapsed}
    >
      {collapsed ? (
        <NotesSidebarCollapsed
          {...sharedProps}
          onExpand={() => setCollapsed(false)}
        />
      ) : (
        <NotesSidebarExpanded
          {...sharedProps}
          isArchiveView={isArchiveView}
          activeSort={sort}
          onActiveSortChange={setSort}
          archiveSort={archiveSort}
          onArchiveSortChange={setArchiveSort}
          onCollapse={() => setCollapsed(true)}
        />
      )}
    </aside>
  )
}
