import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, notesApi, type NoteResponse } from '@/api/client'

type NotesListContextValue = {
  notes: NoteResponse[] | null
  error: string | null
  refreshNotes: () => Promise<void>
  updateNoteInList: (note: NoteResponse) => void
  removeNoteFromList: (id: string) => void
  archivedNotes: NoteResponse[] | null
  archivedError: string | null
  refreshArchivedNotes: () => Promise<void>
  removeNoteFromArchivedList: (id: string) => void
  addNoteToArchivedList: (note: NoteResponse) => void
}

const NotesListContext = createContext<NotesListContextValue | null>(null)

export function NotesListProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NoteResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // null until the user opens the Archive tab and triggers a fetch
  const [archivedNotes, setArchivedNotes] = useState<NoteResponse[] | null>(null)
  const [archivedError, setArchivedError] = useState<string | null>(null)

  const refreshNotes = useCallback(async () => {
    try {
      const data = await notesApi.list()
      setNotes(data)
      setError(null)
    } catch (e: unknown) {
      setNotes(null)
      setError(e instanceof ApiError ? e.message : 'Could not load notes.')
    }
  }, [])

  const refreshArchivedNotes = useCallback(async () => {
    try {
      const data = await notesApi.listArchived()
      setArchivedNotes(data)
      setArchivedError(null)
    } catch (e: unknown) {
      setArchivedNotes(null)
      setArchivedError(e instanceof ApiError ? e.message : 'Could not load archived notes.')
    }
  }, [])

  const updateNoteInList = useCallback((note: NoteResponse) => {
    setNotes((prev) => {
      if (prev === null) return prev
      const idx = prev.findIndex((n) => n.id === note.id)
      if (idx === -1) return [note, ...prev]
      const next = [...prev]
      next[idx] = note
      return next
    })
  }, [])

  const removeNoteFromList = useCallback((id: string) => {
    setNotes((prev) => (prev === null ? prev : prev.filter((n) => n.id !== id)))
  }, [])

  const removeNoteFromArchivedList = useCallback((id: string) => {
    setArchivedNotes((prev) => (prev === null ? prev : prev.filter((n) => n.id !== id)))
  }, [])

  const addNoteToArchivedList = useCallback((note: NoteResponse) => {
    setArchivedNotes((prev) => {
      if (prev === null) return prev
      const idx = prev.findIndex((n) => n.id === note.id)
      if (idx === -1) return [note, ...prev]
      const next = [...prev]
      next[idx] = note
      return next
    })
  }, [])

  useEffect(() => {
    refreshNotes()
  }, [refreshNotes])

  const value = useMemo(
    () => ({
      notes,
      error,
      refreshNotes,
      updateNoteInList,
      removeNoteFromList,
      archivedNotes,
      archivedError,
      refreshArchivedNotes,
      removeNoteFromArchivedList,
      addNoteToArchivedList,
    }),
    [
      notes,
      error,
      refreshNotes,
      updateNoteInList,
      removeNoteFromList,
      archivedNotes,
      archivedError,
      refreshArchivedNotes,
      removeNoteFromArchivedList,
      addNoteToArchivedList,
    ],
  )

  return <NotesListContext.Provider value={value}>{children}</NotesListContext.Provider>
}

export function useNotesList() {
  const ctx = useContext(NotesListContext)
  if (!ctx) {
    throw new Error('useNotesList must be used within NotesListProvider')
  }
  return ctx
}
