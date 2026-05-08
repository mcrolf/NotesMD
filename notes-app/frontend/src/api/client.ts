/** MN 260506 Notes REST API client; base URL from `VITE_API_URL` or `http://localhost:8080`. */

export type NoteResponse = {
  id: string
  title: string
  contentMarkdown: string
  createdAt: string
  updatedAt: string
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

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T

  if (!res.ok) {
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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(joinUrl(path), { ...init, headers })
  return handleResponse<T>(res)
}

export const notesApi = {
  list(): Promise<NoteResponse[]> {
    return apiFetch<NoteResponse[]>('/api/notes')
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

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/notes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}

export { apiBaseUrl }
