import { useMemo, useState } from 'react'
import { Cog, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getApiBaseUrl,
  InvalidApiUrlError,
  normalizeApiUrl,
  setApiBaseUrl,
  validateApiUrl,
} from '@/api/apiConfig'
import { type ApiHealthProbeResult, probeApiHealth } from '@/api/apiHealth'
import { useAuth } from '@/auth/AuthContext'
import { ServerUrlField } from '@/components/ServerUrlField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const PASSWORD_MASK = '••••••••••••'
const PASSWORD_VISIBLE_HINT =
  'Your password is stored on your server and is not saved in this app.'

/** Pretty-print JSON health bodies when possible. */
function formatHealthBody(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

/** Human-readable summary plus response body for the settings health probe. */
function formatHealthProbeDisplay(result: ApiHealthProbeResult): string {
  const lines: string[] = []
  if (result.status !== null) {
    lines.push(`HTTP ${result.status}`)
  }
  if (result.error) {
    lines.push(result.error)
  }
  if (result.body) {
    if (lines.length > 0) lines.push('')
    lines.push(formatHealthBody(result.body))
  }
  return lines.join('\n')
}

/** Header settings control: account details and editable API server URL. */
export function SettingsMenu() {
  const { username, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [serverUrl, setServerUrl] = useState(() => getApiBaseUrl())
  const [initialServerUrl, setInitialServerUrl] = useState(() => getApiBaseUrl())
  const [showPassword, setShowPassword] = useState(false)
  const [showUrlValidation, setShowUrlValidation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [healthChecking, setHealthChecking] = useState(false)
  const [healthResult, setHealthResult] = useState<ApiHealthProbeResult | null>(null)

  function resetFormState() {
    const currentUrl = getApiBaseUrl()
    setServerUrl(currentUrl)
    setInitialServerUrl(currentUrl)
    setShowPassword(false)
    setShowUrlValidation(false)
    setHealthResult(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetFormState()
    }
    setOpen(nextOpen)
  }

  const isDirty = useMemo(() => {
    try {
      return normalizeApiUrl(serverUrl) !== initialServerUrl
    } catch {
      return serverUrl.trim() !== initialServerUrl
    }
  }, [serverUrl, initialServerUrl])

  function handleServerUrlChange(value: string) {
    setServerUrl(value)
    setHealthResult(null)
  }

  async function handleHealthCheck() {
    setShowUrlValidation(true)
    setHealthChecking(true)
    setHealthResult(null)
    try {
      const normalized = normalizeApiUrl(serverUrl)
      setServerUrl(normalized)
      const result = await probeApiHealth(normalized)
      setHealthResult(result)
    } catch (err) {
      if (err instanceof InvalidApiUrlError) {
        setHealthResult({ ok: false, status: null, body: null, error: err.message })
        return
      }
      setHealthResult({
        ok: false,
        status: null,
        body: null,
        error: 'Health check failed.',
      })
    } finally {
      setHealthChecking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isDirty) return

    setShowUrlValidation(true)
    setSubmitting(true)
    try {
      const normalized = setApiBaseUrl(serverUrl)
      const urlChanged = normalized !== initialServerUrl
      setInitialServerUrl(normalized)
      setServerUrl(normalized)
      setOpen(false)

      if (urlChanged) {
        toast.info('Server URL updated. Sign in again with your new server.')
        logout()
        return
      }

      toast.success('Settings saved.')
    } catch (err) {
      if (err instanceof InvalidApiUrlError) {
        toast.error(err.message)
        return
      }
      toast.error('Could not save settings.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="icon-sm"
          aria-label="Open settings"
          title="Settings"
        >
          <Cog aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Account details for this session and your self-hosted API server.
          </DialogDescription>
        </DialogHeader>

        <form className="form-stack-compact" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="settings-username">
              Username
            </label>
            <Input
              id="settings-username"
              name="username"
              value={username ?? ''}
              readOnly
              aria-readonly="true"
              className="bg-muted/40"
            />
          </div>

          <div className="form-field">
            <div className="form-label-row">
              <label className="form-label" htmlFor="settings-password">
                Password
              </label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="button-with-tight-icon"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password hint' : 'Show password hint'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Input
              id="settings-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={showPassword ? PASSWORD_VISIBLE_HINT : PASSWORD_MASK}
              readOnly
              aria-readonly="true"
              className="bg-muted/40"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="settings-email">
              Email
            </label>
            <Input
              id="settings-email"
              name="email"
              value=""
              readOnly
              aria-readonly="true"
              placeholder="Coming soon"
              className="bg-muted/40"
            />
            <p className="text-muted-foreground text-sm">Email support is not available yet.</p>
          </div>

          <ServerUrlField
            id="settings-server-url"
            value={serverUrl}
            onChange={handleServerUrlChange}
            disabled={submitting || healthChecking}
            showValidation={showUrlValidation}
          />

          <div className="form-field">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="button-with-icon"
              disabled={submitting || healthChecking || !validateApiUrl(serverUrl)}
              onClick={() => void handleHealthCheck()}
            >
              {healthChecking ? (
                <>
                  <Loader2 className="spinner-icon" aria-hidden />
                  Checking server…
                </>
              ) : (
                'Check server'
              )}
            </Button>
            {healthResult ? (
              <pre
                className={`mt-2 overflow-x-auto rounded-md border px-3 py-2 font-mono text-xs whitespace-pre-wrap ${
                  healthResult.ok
                    ? 'border-border bg-muted/40 text-foreground'
                    : 'border-destructive/30 bg-destructive/5 text-destructive'
                }`}
                role="status"
                aria-live="polite"
              >
                {formatHealthProbeDisplay(healthResult)}
              </pre>
            ) : null}
          </div>

          {isDirty ? (
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button type="submit" disabled={submitting} className="button-with-icon sm:ml-auto">
                {submitting ? (
                  <>
                    <Loader2 className="spinner-icon" aria-hidden />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </DialogFooter>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}
