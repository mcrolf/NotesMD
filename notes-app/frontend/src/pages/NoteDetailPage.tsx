import { useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, Download, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MarkdownHintsButton } from '@/components/MarkdownHintsButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NoteMarkdown } from '@/components/NoteMarkdown'
import { ApiError, notesApi, type NoteResponse } from '@/api/client'
import { useNotesList } from '@/context/NotesListContext'
import { HOME_PATH } from '@/routes'
import { downloadNoteAsMarkdown } from '@/lib/downloadNoteMarkdown'

export function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    updateNoteInList,
    removeNoteFromList,
    removeNoteFromArchivedList,
    addNoteToArchivedList,
  } = useNotesList()
  const editBodyRef = useRef<HTMLTextAreaElement>(null)
  const [note, setNote] = useState<NoteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [destroying, setDestroying] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const routeError = id ? error : 'Missing note id.'
  const isLoading = id ? loading : false

  useEffect(() => {
    if (!id) return

    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setEditing(false)
      setLoading(true)
      setError(null)
    })

    notesApi
      .get(id)
      .then((data) => {
        if (!cancelled) {
          setNote(data)
          setDraftTitle(data.title ?? '')
          setDraftContent(data.contentMarkdown ?? '')
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setNote(null)
        setError(e instanceof ApiError ? e.message : 'Could not load note.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  function beginEdit() {
    if (!note || note.archivedAt) return
    setDraftTitle(note.title ?? '')
    setDraftContent(note.contentMarkdown ?? '')
    setSaveError(null)
    setEditing(true)
  }

  function cancelEdit() {
    if (note) {
      setDraftTitle(note.title ?? '')
      setDraftContent(note.contentMarkdown ?? '')
    }
    setSaveError(null)
    setEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !note) return
    setSaveError(null)
    setSaving(true)
    try {
      const updated = await notesApi.patch(id, {
        title: draftTitle.trim(),
        contentMarkdown: draftContent.trim(),
      })
      setNote(updated)
      updateNoteInList(updated)
      setDraftTitle(updated.title ?? '')
      setDraftContent(updated.contentMarkdown ?? '')
      setEditing(false)
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmArchive() {
    if (!id || !note) return
    setArchiveError(null)
    setArchiving(true)
    try {
      await notesApi.archive(id)
      removeNoteFromList(id)
      addNoteToArchivedList({ ...note, archivedAt: new Date().toISOString() })
      setArchiveOpen(false)
      navigate(HOME_PATH)
    } catch (err: unknown) {
      setArchiveError(err instanceof ApiError ? err.message : 'Could not archive note.')
    } finally {
      setArchiving(false)
    }
  }

  async function handleRestore() {
    if (!id) return
    setRestoreError(null)
    setRestoring(true)
    try {
      const restored = await notesApi.restore(id)
      removeNoteFromArchivedList(id)
      updateNoteInList(restored)
      setNote(restored)
      setDraftTitle(restored.title ?? '')
      setDraftContent(restored.contentMarkdown ?? '')
    } catch (err: unknown) {
      setRestoreError(err instanceof ApiError ? err.message : 'Could not restore note.')
    } finally {
      setRestoring(false)
    }
  }

  async function handleConfirmDelete() {
    if (!id) return
    setDeleteError(null)
    setDestroying(true)
    try {
      await notesApi.delete(id)
      removeNoteFromArchivedList(id)
      setDeleteOpen(false)
      navigate(HOME_PATH)
    } catch (err: unknown) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete note.')
    } finally {
      setDestroying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="notes-content-pane">
        <p className="loading-text">Loading note…</p>
      </div>
    )
  }

  if (routeError) {
    return (
      <div className="notes-content-pane">
        <div className="note-detail-error" aria-live="polite">
          <p className="note-detail-error-title">Something went wrong</p>
          <p className="note-detail-error-message">{routeError}</p>
        </div>
      </div>
    )
  }

  if (!note) {
    return null
  }

  const isArchived = note.archivedAt != null

  return (
    <>
      {editing && !isArchived ? (
        <form className="note-detail" onSubmit={handleSave}>
          <header className="note-detail-header">
            <div className="note-header-row">
              <div className="note-title-field-wrap">
                <label className="sr-only" htmlFor="edit-note-title">
                  Title
                </label>
                <Input
                  id="edit-note-title"
                  value={draftTitle}
                  onChange={(ev) => setDraftTitle(ev.target.value)}
                  disabled={saving}
                  placeholder="Title"
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
                <Button type="button" variant="outline" size="sm" disabled={saving} onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
            <p className="note-detail-meta">
              Updated {new Date(note.updatedAt).toLocaleString()}
              <span className="metadata-separator">·</span>
              <code className="metadata-code">{note.id}</code>
            </p>
            {saveError ? (
              <p className="error-text" role="alert">
                {saveError}
              </p>
            ) : null}
          </header>
          <div className="note-detail-body note-detail-body-edit">
            <div className="section-heading-row">
              <p className="section-eyebrow">Markdown</p>
              <MarkdownHintsButton
                textareaRef={editBodyRef}
                value={draftContent}
                onChange={setDraftContent}
                disabled={saving}
              />
            </div>
            <label className="sr-only" htmlFor="edit-note-body">
              Body
            </label>
            <Textarea
              ref={editBodyRef}
              id="edit-note-body"
              className="note-detail-editor"
              value={draftContent}
              onChange={(ev) => setDraftContent(ev.target.value)}
              disabled={saving}
            />
          </div>
        </form>
      ) : (
        <article className={`note-detail${isArchived ? ' note-detail--archived' : ''}`}>
          <header className="note-detail-header">
            <div className="note-header-row">
              <h1 className="note-title">
                {note.title?.trim() ? note.title : 'Untitled'}
              </h1>
              <div className="note-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="button-with-icon"
                  onClick={() => downloadNoteAsMarkdown(note)}
                >
                  <Download className="icon-xs" aria-hidden />
                  Download
                </Button>
                {isArchived ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="button-with-icon"
                      disabled={restoring}
                      onClick={handleRestore}
                    >
                      {restoring ? (
                        <>
                          <Loader2 className="spinner-icon" aria-hidden />
                          Restoring…
                        </>
                      ) : (
                        <>
                          <ArchiveRestore className="icon-xs" aria-hidden />
                          Restore
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="button-with-icon"
                      disabled={restoring}
                      onClick={() => {
                        setDeleteError(null)
                        setDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="icon-xs" aria-hidden />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" size="sm" className="button-with-icon" onClick={beginEdit}>
                      <Pencil className="icon-xs" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="button-with-icon"
                      onClick={() => {
                        setArchiveError(null)
                        setArchiveOpen(true)
                      }}
                    >
                      <Archive className="icon-xs" aria-hidden />
                      Archive
                    </Button>
                  </>
                )}
              </div>
            </div>
            <p className="note-detail-meta">
              {isArchived ? (
                <>
                  Archived {new Date(note.archivedAt!).toLocaleString()}
                  <span className="metadata-separator">·</span>
                </>
              ) : null}
              Updated {new Date(note.updatedAt).toLocaleString()}
              <span className="metadata-separator">·</span>
              <code className="metadata-code">{note.id}</code>
            </p>
            {restoreError ? (
              <p className="error-text" role="alert">
                {restoreError}
              </p>
            ) : null}
            {saveError ? (
              <p className="error-text" role="alert">
                {saveError}
              </p>
            ) : null}
          </header>
          <div className="note-detail-body">
            {note.contentMarkdown?.trim() ? (
              <NoteMarkdown markdown={note.contentMarkdown} />
            ) : (
              <p className="blank-note">—</p>
            )}
          </div>
        </article>
      )}

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this note?</AlertDialogTitle>
            <AlertDialogDescription>
              Move &ldquo;{note.title?.trim() ? note.title : 'Untitled'}&rdquo; to the archive? You can restore it
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {archiveError ? (
            <p className="error-text" role="alert">
              {archiveError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="default"
              disabled={archiving}
              className="button-with-icon"
              onClick={handleConfirmArchive}
            >
              {archiving ? (
                <>
                  <Loader2 className="spinner-icon" aria-hidden />
                  Archiving…
                </>
              ) : (
                'Archive'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &ldquo;{note.title?.trim() ? note.title : 'Untitled'}&rdquo; permanently. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="error-text" role="alert">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={destroying}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={destroying}
              className="button-with-icon"
              onClick={handleConfirmDelete}
            >
              {destroying ? (
                <>
                  <Loader2 className="spinner-icon" aria-hidden />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
