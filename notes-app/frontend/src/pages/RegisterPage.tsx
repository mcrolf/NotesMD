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
    <div className="mx-auto flex max-w-md flex-col gap-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Choose a username (3–255 characters) and password (8–128 characters). You will be signed in
            after registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="register-username">
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="register-password">
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
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{' '}
              <Link className="text-primary font-medium underline-offset-4 hover:underline" to={LOGIN_PATH}>
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
