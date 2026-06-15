import { ApiError } from '@/api/client'
import { InvalidApiUrlError } from '@/api/apiConfig'
import { ApiHealthError } from '@/api/apiHealth'

/** Detect fetch-layer failures (network, DNS, CORS, timeout) that never produce an HTTP response. */
function isConnectionError(err: unknown): boolean {
  if (err instanceof TypeError) return true
  if (err instanceof DOMException && err.name === 'AbortError') return true
  if (err instanceof Error) {
    return /failed to fetch|networkerror|load failed|aborted/i.test(err.message)
  }
  return false
}

/** Map auth submit errors to user-facing copy, including server URL connectivity hints. */
export function formatAuthError(serverUrl: string, err: unknown, fallback: string): string {
  if (err instanceof InvalidApiUrlError) return err.message
  if (err instanceof ApiHealthError) return err.message
  if (err instanceof ApiError) return err.message

  if (isConnectionError(err)) {
    try {
      const serverOrigin = new URL(serverUrl).origin
      const appOrigin = window.location.origin
      if (serverOrigin !== appOrigin) {
        return `Server blocked this app. Add this app's origin (${appOrigin}) to CORS_ALLOWED_ORIGINS on your server.`
      }
    } catch {
      /* ignore malformed URL — validation should have caught this */
    }
    return `Cannot reach server at ${serverUrl}. Check the URL and that the API is running.`
  }

  return fallback
}
