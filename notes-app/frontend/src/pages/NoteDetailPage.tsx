import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { NoteMarkdown } from '@/components/NoteMarkdown'
import { ApiError, notesApi, type NoteResponse } from '@/api/client'
import { HOME_PATH } from '@/routes'
import { downloadNoteAsMarkdown } from '@/lib/downloadNoteMarkdown'

export function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState<NoteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [destroying, setDestroying] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setNote(null)
      setError('Missing note id.')
      setLoading(false)
      setEditing(false)
      return
    }

    setEditing(false)
    let cancelled = false
    setLoading(true)
    setError(null)
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
    if (!note) return
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
      setDraftTitle(updated.title ?? '')
      setDraftContent(updated.contentMarkdown ?? '')
      setEditing(false)
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!id) return
    setDeleteError(null)
    setDestroying(true)
    try {
      await notesApi.delete(id)
      setDeleteOpen(false)
      navigate(HOME_PATH)
    } catch (err: unknown) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete note.')
    } finally {
      setDestroying(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-12">
      <Button asChild variant="ghost" className="w-fit gap-2 pl-0">
        <Link to={HOME_PATH}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to list
        </Link>
      </Button>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading note…</p>
      ) : null}

      {error && !loading ? (
        <Card aria-live="polite" className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Something went wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {note && !loading ? (
        <Card>
          {editing ? (
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="w-full min-w-0 space-y-3">
                    <label className="sr-only" htmlFor="edit-note-title">
                      Title
                    </label>
                    <Input
                      id="edit-note-title"
                      value={draftTitle}
                      onChange={(ev) => setDraftTitle(ev.target.value)}
                      disabled={saving}
                      placeholder="Title"
                      className="font-heading text-xl font-semibold tracking-tight"
                    />
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <Button type="submit" disabled={saving} className="gap-2" size="sm">
                      {saving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
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
                <CardDescription>
                  Updated {new Date(note.updatedAt).toLocaleString()}
                  <span className="mx-1">·</span>
                  <code className="bg-muted rounded px-1 py-0.5 text-xs">{note.id}</code>
                </CardDescription>
                {saveError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {saveError}
                  </p>
                ) : null}
              </CardHeader>
              <Separator />
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Markdown
                </p>
                <label className="sr-only" htmlFor="edit-note-body">
                  Body
                </label>
                <Textarea
                  id="edit-note-body"
                  className="min-h-48 font-mono text-sm"
                  value={draftContent}
                  onChange={(ev) => setDraftContent(ev.target.value)}
                  disabled={saving}
                />
              </CardContent>
            </form>
          ) : (
            <>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="font-heading pr-4 text-2xl tracking-tight">
                    {note.title?.trim() ? note.title : 'Untitled'}
                  </CardTitle>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => downloadNoteAsMarkdown(note)}
                    >
                      <Download className="size-3.5" aria-hidden />
                      Download
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={beginEdit}>
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setDeleteError(null)
                        setDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Delete
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Updated {new Date(note.updatedAt).toLocaleString()}
                  <span className="mx-1">·</span>
                  <code className="bg-muted rounded px-1 py-0.5 text-xs">{note.id}</code>
                </CardDescription>
                {saveError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {saveError}
                  </p>
                ) : null}
              </CardHeader>
              <Separator />
              <CardContent>
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Markdown preview
                </p>
                <div className="bg-muted/30 max-h-[min(32rem,60svh)] overflow-auto rounded-lg border p-4">
                  {note.contentMarkdown?.trim() ? (
                    <NoteMarkdown markdown={note.contentMarkdown} />
                  ) : (
                    <p className="text-muted-foreground text-sm">—</p>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &ldquo;{note?.title?.trim() ? note.title : 'Untitled'}&rdquo; permanently. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={destroying}>Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={destroying} className="gap-2" onClick={handleConfirmDelete}>
              {destroying ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
