import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, CandidateRegistrationInput } from '../services/authService'

export type User = {
  id: string
  name: string
  email: string
  headline?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<User>
  register: (data: CandidateRegistrationInput) => Promise<User>
  logout: () => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    authService.restoreSession().then((u) => {
      if (cancelled) return
      setUser(u)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = () => {
    setLoading(true)
    authService.restoreSession().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }

  const login = async (email: string, password: string, remember = true) => {
    const u = await authService.login(email, password, remember)
    setUser(u)
    return u
  }

  const register = async (data: CandidateRegistrationInput) => {
    const u = await authService.register(data)
    setUser(u)
    return u
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
