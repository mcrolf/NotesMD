import { Outlet } from 'react-router-dom'
import { NotesSidebar } from '@/components/NotesSidebar'
import { NotesListProvider } from '@/context/NotesListContext'

export function NotesLayout() {
  return (
    <NotesListProvider>
      <div className="notes-workspace">
        <NotesSidebar />
        <div className="notes-content">
          <Outlet />
        </div>
      </div>
    </NotesListProvider>
  )
}
