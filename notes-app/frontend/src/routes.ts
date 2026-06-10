/** Browser path for the notes list (home). */
export const HOME_PATH = '/notes'

/** Pre-rebrand home path; bookmarks and saved login redirects may still reference it. */
export const LEGACY_HOME_PATH = '/webclock-notes'

export const LOGIN_PATH = '/login'
export const REGISTER_PATH = '/register'

/** Safe post-login destination: maps legacy paths and rejects unknown routes. */
export function resolvePostLoginPath(pathname: string | undefined): string {
  if (!pathname || pathname === LEGACY_HOME_PATH || pathname === '/') {
    return HOME_PATH
  }
  if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) {
    return HOME_PATH
  }
  if (pathname === HOME_PATH || pathname.startsWith('/notes/') || pathname === '/notes/new') {
    return pathname
  }
  return HOME_PATH
}

// MN 260508 Hash routing for packaged Electron (loadFile) or explicit electron Vite mode.
/** True when the app should use HashRouter (file:// or `vite build --mode electron`). */
export function shouldUseHashRouter(): boolean {
  if (import.meta.env.MODE === 'electron') return true
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') return true
  return false
}
