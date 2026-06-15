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
import { ThemeToggle } from '@/components/ThemeToggle'
import { SettingsMenu } from '@/components/SettingsMenu'
import { Button } from '@/components/ui/button'
import { NoteDetailPage } from '@/pages/NoteDetailPage'
import { NoteNewPage } from '@/pages/NoteNewPage'
import { NotesLayout } from '@/pages/NotesLayout'
import { NotesWelcomePage } from '@/pages/NotesWelcomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import {
  HOME_PATH,
  LEGACY_HOME_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  shouldUseHashRouter,
} from '@/routes'

function AppHeader() {
  const { isAuthenticated, username, logout } = useAuth()
  return (
    <div className="app-header">
      <div className="app-header-inner">
        <Link to={HOME_PATH} className="app-brand">
          <StickyNote className="app-brand-icon" aria-hidden />
          NotesMD
        </Link>
        <div className="app-actions">
          {isAuthenticated ? (
            <>
              {username ? (
                <span className="app-username">{username}</span>
              ) : null}
              <SettingsMenu />
              <Button type="button" variant="default" size="sm" onClick={logout}>
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
          <ThemeToggle />
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
      className="skip-link"
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
      <main id="main" tabIndex={-1} className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
          <Route path={LEGACY_HOME_PATH} element={<Navigate to={HOME_PATH} replace />} />
          <Route path={LOGIN_PATH} element={<LoginPage />} />
          <Route path={REGISTER_PATH} element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/notes" element={<NotesLayout />}>
              <Route index element={<NotesWelcomePage />} />
              <Route path="new" element={<NoteNewPage />} />
              <Route path=":id" element={<NoteDetailPage />} />
            </Route>
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
        <div className="app-shell">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
