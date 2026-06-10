import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { MarkdownHintsButton } from '@/components/MarkdownHintsButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, notesApi } from '@/api/client'
import { useNotesList } from '@/context/NotesListContext'
import { HOME_PATH } from '@/routes'

export function NoteNewPage() {
  const navigate = useNavigate()
  const { updateNoteInList } = useNotesList()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState('')
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const trimmedTitle = title.trim()
      const trimmedBody = contentMarkdown.trim()
      const created = await notesApi.create({
        title: trimmedTitle.length > 0 ? trimmedTitle : null,
        contentMarkdown: trimmedBody.length > 0 ? trimmedBody : null,
      })
      updateNoteInList(created)
      navigate(`/notes/${created.id}`)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Could not create note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="note-detail" onSubmit={handleSubmit}>
      {/* Title row and save/cancel actions */}
      <header className="note-detail-header">
        <div className="note-header-row">
          <div className="note-title-field-wrap">
            <label className="sr-only" htmlFor="new-note-title">
              Title
            </label>
            <Input
              id="new-note-title"
              name="title"
              autoComplete="off"
              placeholder="Title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              disabled={saving}
              className="title-input"
            />
          </div>
          <div className="note-actions">
            <Button type="submit" disabled={saving} className="button-with-icon" size="sm">
              {saving ? (
                <>
                  <Loader2 className="spinner-icon" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={saving} asChild>
              <Link to={HOME_PATH}>Cancel</Link>
            </Button>
          </div>
        </div>
        <p className="note-detail-meta">Unsaved draft</p>
        {error ? (
          <p className="error-text" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      {/* Markdown editor fills the remaining pane height */}
      <div className="note-detail-body note-detail-body-edit">
        <div className="section-heading-row">
          <p className="section-eyebrow">Markdown</p>
          <MarkdownHintsButton
            textareaRef={bodyRef}
            value={contentMarkdown}
            onChange={setContentMarkdown}
            disabled={saving}
          />
        </div>
        <label className="sr-only" htmlFor="new-note-body">
          Body
        </label>
        <Textarea
          ref={bodyRef}
          id="new-note-body"
          name="contentMarkdown"
          className="note-detail-editor"
          value={contentMarkdown}
          onChange={(ev) => setContentMarkdown(ev.target.value)}
          disabled={saving}
        />
      </div>
    </form>
  )
}
