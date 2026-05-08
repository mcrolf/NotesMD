import {
  BrowserRouter,
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { StickyNote } from 'lucide-react'
import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { NoteDetailPage } from '@/pages/NoteDetailPage'
import { NoteNewPage } from '@/pages/NoteNewPage'
import { NotesListPage } from '@/pages/NotesListPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { HOME_PATH, LOGIN_PATH, REGISTER_PATH, shouldUseHashRouter } from '@/routes'

function AppHeader() {
  const { isAuthenticated, username, logout } = useAuth()
  return (
    <div className="border-border/60 bg-card/40 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to={HOME_PATH}
          className="font-heading flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <StickyNote className="size-5 shrink-0" aria-hidden />
          WebClock Notes
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {username ? (
                <span className="text-muted-foreground hidden max-w-[10rem] truncate text-sm sm:inline">
                  {username}
                </span>
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={LOGIN_PATH}>Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={REGISTER_PATH}>Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SkipLink() {
  const hashRouting = shouldUseHashRouter()
  return (
    <a
      href={hashRouting ? '#' : '#main'}
      className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
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
  )
}

function AppRoutes() {
  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-4 sm:px-6">
        <Routes>
          <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
          <Route path={LOGIN_PATH} element={<LoginPage />} />
          <Route path={REGISTER_PATH} element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path={HOME_PATH} element={<NotesListPage />} />
            <Route path="/notes/new" element={<NoteNewPage />} />
            <Route path="/notes/:id" element={<NoteDetailPage />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

function App() {
  const hashRouting = shouldUseHashRouter()
  const Router = hashRouting ? HashRouter : BrowserRouter
  return (
    <Router>
      <AuthProvider>
        <div className="bg-background min-h-svh">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
