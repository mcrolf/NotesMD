/** Connectivity probe against a NotesMD API origin before auth requests. */

const HEALTH_TIMEOUT_MS = 5000

export class ApiHealthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiHealthError'
  }
}

/** Result of a manual health probe, including the raw actuator response body. */
export type ApiHealthProbeResult = {
  ok: boolean
  status: number | null
  body: string | null
  error: string | null
}

function isConnectionError(err: unknown): boolean {
  if (err instanceof TypeError) return true
  if (err instanceof DOMException && err.name === 'AbortError') return true
  if (err instanceof Error) {
    return /failed to fetch|networkerror|load failed|aborted/i.test(err.message)
  }
  return false
}

function formatProbeConnectionError(serverUrl: string, err: unknown): string {
  if (isConnectionError(err)) {
    try {
      const serverOrigin = new URL(serverUrl).origin
      const appOrigin = window.location.origin
      if (serverOrigin !== appOrigin) {
        return `Server blocked this app. Add this app's origin (${appOrigin}) to CORS_ALLOWED_ORIGINS on your server.`
      }
    } catch {
      /* ignore malformed URL */
    }
    return `Cannot reach server at ${serverUrl}. Check the URL and that the API is running.`
  }
  return 'Health check failed.'
}

async function fetchHealthResponse(baseUrl: string): Promise<{ status: number; body: string }> {
  const origin = baseUrl.replace(/\/$/, '')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)

  try {
    const res = await fetch(`${origin}/actuator/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    const body = await res.text()
    return { status: res.status, body }
  } finally {
    clearTimeout(timeoutId)
  }
}

/** GET /actuator/health with a short timeout; returns true when the server responds 200. */
export async function checkApiHealth(baseUrl: string): Promise<boolean> {
  const { status } = await fetchHealthResponse(baseUrl)
  return status === 200
}

/** Fetch actuator health and return status plus body for display in settings. */
export async function probeApiHealth(baseUrl: string): Promise<ApiHealthProbeResult> {
  try {
    const { status, body } = await fetchHealthResponse(baseUrl)
    const trimmedBody = body.trim().length > 0 ? body : null
    return {
      ok: status === 200,
      status,
      body: trimmedBody,
      error: status === 200 ? null : `Server returned HTTP ${status}.`,
    }
  } catch (err) {
    return {
      ok: false,
      status: null,
      body: null,
      error: formatProbeConnectionError(baseUrl, err),
    }
  }
}

/** Run the health probe and throw when the server is unreachable or unhealthy. */
export async function assertApiHealth(baseUrl: string): Promise<void> {
  const healthy = await checkApiHealth(baseUrl)
  if (!healthy) {
    throw new ApiHealthError(
      `Cannot reach server at ${baseUrl}. Check the URL and that the API is running.`,
    )
  }
}
