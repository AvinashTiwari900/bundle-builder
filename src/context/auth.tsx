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
  login: (email: string, password: string, remember?: boolean) => Promise<User>
  register: (data: CandidateRegistrationInput) => Promise<User>
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSession())

  useEffect(() => {
    const u = authService.getSession()
    if (u) setUser(u)
  }, [])

  const refresh = () => {
    setUser(authService.getSession())
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

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
