import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, notesApi } from '@/api/client'
import { HOME_PATH } from '@/routes'

export function NoteNewPage() {
  const navigate = useNavigate()
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
      navigate(`/notes/${created.id}`)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Could not create note.')
    } finally {
      setSaving(false)
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
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">New note</CardTitle>
          <CardDescription>Draft in Markdown, then save. This calls POST /api/notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="new-note-title">
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="new-note-body">
                Body
              </label>
              <Textarea
                id="new-note-body"
                name="contentMarkdown"
                className="min-h-48 font-mono text-sm"
                placeholder={'## Heading\n\nWrite markdown here.'}
                value={contentMarkdown}
                onChange={(ev) => setContentMarkdown(ev.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
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
