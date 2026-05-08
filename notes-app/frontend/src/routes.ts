/** Browser path for the notes list (home). */
export const HOME_PATH = '/webclock-notes'

export const LOGIN_PATH = '/login'
export const REGISTER_PATH = '/register'

// MN 260508 Hash routing for packaged Electron (loadFile) or explicit electron Vite mode.
/** True when the app should use HashRouter (file:// or `vite build --mode electron`). */
export function shouldUseHashRouter(): boolean {
  if (import.meta.env.MODE === 'electron') return true
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') return true
  return false
}
