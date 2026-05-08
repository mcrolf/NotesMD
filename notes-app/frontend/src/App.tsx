import {
  BrowserRouter,
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { StickyNote } from 'lucide-react'
import { NoteDetailPage } from '@/pages/NoteDetailPage'
import { NoteNewPage } from '@/pages/NoteNewPage'
import { NotesListPage } from '@/pages/NotesListPage'
import { HOME_PATH, shouldUseHashRouter } from '@/routes'

function App() {
  const hashRouting = shouldUseHashRouter()
  const Router = hashRouting ? HashRouter : BrowserRouter
  return (
    <Router>
      <div className="bg-background min-h-svh">
        <a
          href={hashRouting ? '#' : '#main'}
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
          // MN 260508 `#main` would steal HashRouter location; native skip only works with BrowserRouter.
          onClick={
            hashRouting
              ? (e) => {
                  e.preventDefault()
                  document.getElementById('main')?.focus({ preventScroll: false })
                  document.getElementById('main')?.scrollIntoView()
                }
              : undefined
          }
        >
          Skip to content
        </a>
        <div className="border-border/60 bg-card/40 border-b backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              to={HOME_PATH}
              className="font-heading flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <StickyNote className="size-5 shrink-0" aria-hidden />
              WebClock Notes
            </Link>
          </div>
        </div>
        <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
            <Route path={HOME_PATH} element={<NotesListPage />} />
            <Route path="/notes/new" element={<NoteNewPage />} />
            <Route path="/notes/:id" element={<NoteDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
