import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getApiBaseUrl, setApiBaseUrl } from '@/api/apiConfig'
import { assertApiHealth } from '@/api/apiHealth'
import { useAuth } from '@/auth/AuthContext'
import { formatAuthError } from '@/auth/formatAuthError'
import { ServerUrlField } from '@/components/ServerUrlField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { REGISTER_PATH, resolvePostLoginPath } from '@/routes'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverUrl, setServerUrl] = useState(() => getApiBaseUrl())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showServerUrl, setShowServerUrl] = useState(false)
  const [showUrlValidation, setShowUrlValidation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = resolvePostLoginPath(
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname,
  )

  useEffect(() => {
    document.title = 'Sign in — NotesMD'
    return () => {
      document.title = 'NotesMD'
    }
  }, [])

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setShowUrlValidation(true)
    setSubmitting(true)
    try {
      const baseUrl = setApiBaseUrl(serverUrl)
      setServerUrl(baseUrl)
      await assertApiHealth(baseUrl)
      await login(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err: unknown) {
      const message = formatAuthError(serverUrl, err, 'Sign in failed.')
      if (message !== 'Sign in failed.') {
        setShowServerUrl(true)
      }
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell-narrow">
      <Card>
        <CardHeader>
          <CardTitle className="card-title-lg">Sign in</CardTitle>
          <CardDescription>
            Use your NotesMD account. Username at least 3 characters; password at least 8.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="form-stack" onSubmit={handleSubmit}>
            {error ? (
              <p className="error-text" role="alert">
                {error}
              </p>
            ) : null}
            <p className="auth-server-toggle">
              <button
                type="button"
                className="text-link"
                onClick={() => setShowServerUrl((visible) => !visible)}
                disabled={submitting}
                aria-expanded={showServerUrl}
                aria-controls="login-server-url-section"
              >
                {showServerUrl ? 'Hide server URL' : 'Use a different server'}
              </button>
            </p>
            {showServerUrl ? (
              <div id="login-server-url-section">
                <ServerUrlField
                  id="login-server-url"
                  value={serverUrl}
                  onChange={setServerUrl}
                  disabled={submitting}
                  showValidation={showUrlValidation}
                />
              </div>
            ) : null}
            <div className="form-field">
              <label className="form-label" htmlFor="login-username">
                Username
              </label>
              <Input
                id="login-username"
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={255}
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                disabled={submitting}
              />
            </div>
            <Button type="submit" disabled={submitting} className="button-with-icon">
              {submitting ? (
                <>
                  <Loader2 className="spinner-icon" aria-hidden />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            <p className="auth-footer">
              No account?{' '}
              <Link className="text-link" to={REGISTER_PATH}>
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
