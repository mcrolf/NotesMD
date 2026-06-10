import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, notesApi, type NoteResponse } from '@/api/client'

type NotesListContextValue = {
  notes: NoteResponse[] | null
  error: string | null
  refreshNotes: () => Promise<void>
  updateNoteInList: (note: NoteResponse) => void
  removeNoteFromList: (id: string) => void
}

const NotesListContext = createContext<NotesListContextValue | null>(null)

export function NotesListProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NoteResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    }),
    [notes, error, refreshNotes, updateNoteInList, removeNoteFromList],
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
