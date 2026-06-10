/** MN 260506 Notes REST API client; base URL from `VITE_API_URL` or `http://localhost:8080`. */

import { getAccessToken } from '@/auth/authStorage'

export type NoteResponse = {
  id: string
  title: string
  contentMarkdown: string
  createdAt: string
  updatedAt: string
  /** ISO timestamp when archived; null while the note is active */
  archivedAt: string | null
}

export type NoteCreateRequest = {
  title?: string | null
  contentMarkdown?: string | null
}

export type NoteUpdateRequest = {
  title?: string | null
  contentMarkdown?: string | null
}

export type ApiErrorBody = {
  status: number
  error: string
  message: string
  fieldErrors?: Record<string, string> | null
}

export class ApiError extends Error {
  httpStatus: number
  body: ApiErrorBody | undefined

  constructor(message: string, httpStatus: number, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.httpStatus = httpStatus
    this.body = body
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Wired by `AuthProvider` so 401 on Bearer requests clears the session and redirects to login. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (trimmed.length > 0) return trimmed.replace(/\/$/, '')
  return 'http://localhost:8080'
}

function joinUrl(path: string): string {
  const base = apiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

async function parseJson<T>(res: Response): Promise<T | undefined> {
  const text = await res.text()
  if (!text) return undefined
  return JSON.parse(text) as T
}

async function handleResponse<T>(res: Response, hadAuth: boolean): Promise<T> {
  if (res.status === 204) return undefined as T

  if (!res.ok) {
    if (res.status === 401 && hadAuth) {
      unauthorizedHandler?.()
    }
    const text = await res.text()
    let body: ApiErrorBody | undefined
    try {
      body = text ? (JSON.parse(text) as ApiErrorBody) : undefined
    } catch {
      /* ignore */
    }
    const message = (body?.message ?? text) || res.statusText || 'Request failed'
    throw new ApiError(message, res.status, body)
  }

  const data = await parseJson<T>(res)
  return data as T
}

export type ApiFetchInit = RequestInit & { skipAuth?: boolean }

export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const { skipAuth, ...rest } = init ?? {}
  const headers = new Headers(rest.headers)
  if (rest.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = skipAuth === true ? null : getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const hadAuth = headers.has('Authorization')
  const res = await fetch(joinUrl(path), { ...rest, headers })
  return handleResponse<T>(res, hadAuth)
}

export const notesApi = {
  list(): Promise<NoteResponse[]> {
    return apiFetch<NoteResponse[]>('/api/notes')
  },

  /** Archived notes only, most recently archived first */
  listArchived(): Promise<NoteResponse[]> {
    return apiFetch<NoteResponse[]>('/api/notes/archived')
  },

  get(id: string): Promise<NoteResponse> {
    return apiFetch<NoteResponse>(`/api/notes/${encodeURIComponent(id)}`)
  },

  create(body: NoteCreateRequest): Promise<NoteResponse> {
    return apiFetch<NoteResponse>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  patch(id: string, body: NoteUpdateRequest): Promise<NoteResponse> {
    return apiFetch<NoteResponse>(`/api/notes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  /** Soft-archive an active note (204) */
  archive(id: string): Promise<void> {
    return apiFetch<void>(`/api/notes/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    })
  },

  /** Restore an archived note back to the active list */
  restore(id: string): Promise<NoteResponse> {
    return apiFetch<NoteResponse>(`/api/notes/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
    })
  },

  /** Permanent delete — only allowed for archived notes */
  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/notes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}

export type AuthCredentialsRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
  username: string
}

export type AuthRegisterResponse = {
  userId: string
  username: string
}

export const authApi = {
  register(body: AuthCredentialsRequest): Promise<AuthRegisterResponse> {
    return apiFetch<AuthRegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    })
  },

  login(body: AuthCredentialsRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    })
  },
}

export { apiBaseUrl }
