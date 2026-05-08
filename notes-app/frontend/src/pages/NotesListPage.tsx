import { Link } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ApiError, notesApi, type NoteResponse } from '@/api/client'

type NotesSortOption =
  | 'updated-desc'
  | 'updated-asc'
  | 'created-desc'
  | 'created-asc'
  | 'title-asc'
  | 'title-desc'

function cmpIso(a: string, b: string): number {
  return a.localeCompare(b)
}

function displayTitle(note: NoteResponse): string {
  const t = note.title.trim()
  return t.length > 0 ? t : 'Untitled'
}

function sortedNotes(items: NoteResponse[], sort: NotesSortOption): NoteResponse[] {
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

export function NotesListPage() {
  const [notes, setNotes] = useState<NoteResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<NotesSortOption>('updated-desc')

  const sorted = useMemo(
    () => (notes !== null ? sortedNotes(notes, sort) : null),
    [notes, sort],
  )

  useEffect(() => {
    let cancelled = false
    notesApi
      .list()
      .then((data) => {
        if (!cancelled) setNotes(data)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setNotes(null)
        setError(e instanceof ApiError ? e.message : 'Could not load notes.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
            WebClock
          </p>
          <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
            Markdown notes for your WebClock projects.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link to="/notes/new">
            <Plus className="size-4" aria-hidden />
            New note
          </Link>
        </Button>
      </header>

      <Separator />

      {error ? (
        <Card aria-live="polite" className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Something went wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {notes === null && !error ? (
        <p className="text-muted-foreground text-sm">Loading notes…</p>
      ) : null}

      {notes && notes.length === 0 && !error ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="bg-muted mb-2 flex size-12 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground size-6" aria-hidden />
            </div>
            <CardTitle className="text-lg">No notes yet</CardTitle>
            <CardDescription>
              Create one from the editor — the API is ready when the backend is running.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild variant="secondary">
              <Link to="/notes/new">Write the first note</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {notes && notes.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="notes-sort" className="text-muted-foreground text-sm font-medium">
              Sort
            </label>
            <select
              id="notes-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as NotesSortOption)}
              className={cn(
                'h-8 w-full min-w-[12rem] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none sm:w-auto',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                'dark:bg-input/30',
              )}
            >
              <option value="updated-desc">Recently updated</option>
              <option value="updated-asc">Least recently updated</option>
              <option value="created-desc">Newest first (created)</option>
              <option value="created-asc">Oldest first (created)</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
            </select>
          </div>
          <ScrollArea className="h-[min(28rem,calc(100svh-12rem))] pr-3">
            <ul className="flex flex-col gap-3">
              {sorted?.map((n) => (
                <li key={n.id}>
                  <div className="flex items-stretch gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto min-w-0 flex-1 justify-start px-4 py-3 text-left font-normal"
                    >
                      <Link to={`/notes/${n.id}`}>
                        <span className="line-clamp-1 font-medium">{displayTitle(n)}</span>
                        <span className="text-muted-foreground block text-xs">
                          Updated {new Date(n.updatedAt).toLocaleString()}
                        </span>
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  )
}
