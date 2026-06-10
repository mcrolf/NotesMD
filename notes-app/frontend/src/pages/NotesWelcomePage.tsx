import { Link } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotesList } from '@/context/NotesListContext'

export function NotesWelcomePage() {
  const { notes, error } = useNotesList()

  if (notes === null && !error) {
    return (
      <div className="notes-content-pane">
        <p className="loading-text">Loading…</p>
      </div>
    )
  }

  if (notes && notes.length > 0) {
    return (
      <div className="notes-content-pane notes-content-pane-centered">
        <div className="notes-welcome">
        <div className="notes-welcome-icon" aria-hidden>
          <FileText className="notes-welcome-icon-svg" />
        </div>
        <h1 className="notes-welcome-title">Select a note</h1>
        <p className="notes-welcome-description">
          Choose a note from the sidebar, or start a new one.
        </p>
        <Button asChild variant="secondary" className="button-with-icon">
          <Link to="/notes/new">
            <Plus className="icon-sm" aria-hidden />
            New note
          </Link>
        </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="notes-content-pane notes-content-pane-centered">
      <div className="notes-welcome">
      <div className="notes-welcome-icon" aria-hidden>
        <FileText className="notes-welcome-icon-svg" />
      </div>
      <h1 className="notes-welcome-title">No notes yet</h1>
      <p className="notes-welcome-description">
        Create a new note to get started.
      </p>
      <Button asChild variant="secondary" className="button-with-icon">
        <Link to="/notes/new">
          <Plus className="icon-sm" aria-hidden />
          New note
        </Link>
      </Button>
      </div>
    </div>
  )
}
