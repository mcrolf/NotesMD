import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HOME_PATH, LOGIN_PATH } from '@/routes'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Register — NotesMD'
    return () => {
      document.title = 'NotesMD'
    }
  }, [])

  if (isAuthenticated) {
    return <Navigate to={HOME_PATH} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(username.trim(), password)
      navigate(HOME_PATH, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell-narrow">
      <Card>
        <CardHeader>
          <CardTitle className="card-title-lg">Create an account</CardTitle>
          <CardDescription>
            Choose a username (3–255 characters) and password (8–128 characters). You will be signed in
            after registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="form-stack" onSubmit={handleSubmit}>
            {error ? (
              <p className="error-text" role="alert">
                {error}
              </p>
            ) : null}
            <div className="form-field">
              <label className="form-label" htmlFor="register-username">
                Username
              </label>
              <Input
                id="register-username"
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
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
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
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <p className="auth-footer">
              Already have an account?{' '}
              <Link className="text-link" to={LOGIN_PATH}>
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
