import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi, setUnauthorizedHandler } from '@/api/client'
import { LOGIN_PATH } from '@/routes'
import {
  clearSession,
  getAccessToken,
  getStoredUsername,
  setSession,
} from '@/auth/authStorage'

type AuthContextValue = {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    getAccessToken() ? getStoredUsername() : null,
  )
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handler = () => {
      clearSession()
      setUsername(null)
      navigate(LOGIN_PATH, { replace: true, state: { from: location } })
    }
    setUnauthorizedHandler(handler)
    return () => setUnauthorizedHandler(null)
  }, [navigate, location])

  const login = useCallback(async (user: string, password: string) => {
    const res = await authApi.login({ username: user, password })
    setSession(res.accessToken, res.username)
    setUsername(res.username)
  }, [])

  const register = useCallback(async (user: string, password: string) => {
    await authApi.register({ username: user, password })
    const res = await authApi.login({ username: user, password })
    setSession(res.accessToken, res.username)
    setUsername(res.username)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUsername(null)
    navigate(LOGIN_PATH)
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(getAccessToken()),
      username: getAccessToken() ? username : null,
      login,
      register,
      logout,
    }),
    [username, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
