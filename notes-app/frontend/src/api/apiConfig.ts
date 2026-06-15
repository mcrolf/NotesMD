/** Runtime API origin: localStorage override, then `VITE_API_URL`, then localhost fallback. */

import { clearSession } from '@/auth/authStorage'

const STORAGE_KEY = 'notesmd_api_base_url'

export class InvalidApiUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidApiUrlError'
  }
}

/** Build-time / env default when nothing is stored in localStorage. */
function buildDefaultUrl(): string {
  const raw = import.meta.env.VITE_API_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (trimmed.length > 0) return trimmed.replace(/\/$/, '')
  return 'http://localhost:8080'
}

function readStoredUrl(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null || stored.trim().length === 0) return null
    return stored
  } catch {
    return null
  }
}

/** Trim, strip trailing slash, and reject path suffixes such as `/api`. */
export function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    throw new InvalidApiUrlError('Enter your NotesMD server URL.')
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new InvalidApiUrlError('Enter a valid URL (e.g. https://notes.example.com).')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new InvalidApiUrlError('URL must use http:// or https://.')
  }

  if (!url.hostname) {
    throw new InvalidApiUrlError('Enter a valid URL with a host name.')
  }

  const path = url.pathname.replace(/\/$/, '')
  if (path.length > 0) {
    if (path === '/api' || path.startsWith('/api/')) {
      throw new InvalidApiUrlError('Enter the server origin only (no /api path).')
    }
    throw new InvalidApiUrlError('Enter the server origin only (no path suffix).')
  }

  return `${url.protocol}//${url.host}`
}

/** Returns true when the string is a valid http(s) API origin. */
export function validateApiUrl(url: string): boolean {
  try {
    normalizeApiUrl(url)
    return true
  } catch {
    return false
  }
}

/** Stored URL → `VITE_API_URL` → `http://localhost:8080`. */
export function getApiBaseUrl(): string {
  const stored = readStoredUrl()
  if (stored !== null) return stored
  return buildDefaultUrl()
}

/** Normalize, validate, persist; clears the auth session when the effective origin changes. */
export function setApiBaseUrl(raw: string): string {
  const normalized = normalizeApiUrl(raw)
  const current = getApiBaseUrl()
  if (current !== normalized) {
    clearSession()
  }
  try {
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    /* storage unavailable — URL still applies for this page load */
  }
  return normalized
}

/** Remove the stored override and clear session when it was in use. */
export function clearApiBaseUrl(): void {
  const hadStored = readStoredUrl() !== null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  if (hadStored) {
    clearSession()
  }
}
