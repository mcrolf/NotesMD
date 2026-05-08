/** Session-scoped auth (clears when the tab closes). Access token for Bearer JWT. */

const TOKEN_KEY = 'webclock_notes_access_token'
const USERNAME_KEY = 'webclock_notes_username'

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUsername(): string | null {
  try {
    return sessionStorage.getItem(USERNAME_KEY)
  } catch {
    return null
  }
}

export function setSession(accessToken: string, username: string): void {
  sessionStorage.setItem(TOKEN_KEY, accessToken)
  sessionStorage.setItem(USERNAME_KEY, username)
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USERNAME_KEY)
}
