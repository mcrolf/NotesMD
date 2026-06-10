import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { MarkdownHintsButton } from '@/components/MarkdownHintsButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="notes-content-pane">
    <Card>
        <CardHeader>
          <CardTitle className="card-title-lg">New note</CardTitle>
          <CardDescription>Draft in Markdown, then save.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="form-stack" onSubmit={handleSubmit}>
            {error ? (
              <p className="error-text" role="alert">
                {error}
              </p>
            ) : null}
            <div className="form-field">
              <label className="form-label" htmlFor="new-note-title">
                Title
              </label>
              <Input
                id="new-note-title"
                name="title"
                autoComplete="off"
                placeholder="Meeting ideas"
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                disabled={saving}
              />
            </div>
            <div className="form-field">
              <div className="form-label-row">
                <label className="form-label" htmlFor="new-note-body">
                  Body
                </label>
                <MarkdownHintsButton
                  textareaRef={bodyRef}
                  value={contentMarkdown}
                  onChange={setContentMarkdown}
                  disabled={saving}
                />
              </div>
              <Textarea
                ref={bodyRef}
                id="new-note-body"
                name="contentMarkdown"
                className="editor-textarea"
                placeholder={'## Heading\n\nWrite markdown here.'}
                value={contentMarkdown}
                onChange={(ev) => setContentMarkdown(ev.target.value)}
                disabled={saving}
              />
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={saving} className="button-with-icon">
                {saving ? (
                  <>
                    <Loader2 className="spinner-icon" aria-hidden />
                    Saving…
                  </>
                ) : (
                  'Save note'
                )}
              </Button>
              <Button type="button" variant="outline" disabled={saving} asChild>
                <Link to={HOME_PATH}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
