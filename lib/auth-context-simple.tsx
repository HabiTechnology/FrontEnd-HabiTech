"use client"

import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isAuthorized: boolean
  user: any
  login: () => void
  logout: () => void
  isLoading: boolean
}

const defaultValues: AuthContextType = {
  isAuthenticated: false,
  isAuthorized: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false
}

const AuthContext = createContext<AuthContextType>(defaultValues)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Por ahora, retornamos valores por defecto
  return (
    <AuthContext.Provider value={defaultValues}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
