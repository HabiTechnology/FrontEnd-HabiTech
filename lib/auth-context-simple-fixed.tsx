"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthIntegrated, UserRole } from '@/hooks/use-auth-integrated'

interface AuthContextType {
  isAuthenticated: boolean
  userRole: UserRole
  userAddress?: string
  userInfo?: any
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => void
  isAdmin: boolean
  isResident: boolean
  isUnauthorized: boolean
  isContractConnected: boolean  // Nuevo campo
  address: string | null  // Compatibilidad con código existente
  user: any  // Compatibilidad con código existente
  isAuthorized: boolean  // Compatibilidad con código existente
  isLoading: boolean  // Compatibilidad con código existente
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthIntegrated()

  // Mapear propiedades para compatibilidad con el contexto anterior
  const contextValue: AuthContextType = {
    ...auth,
    address: auth.userAddress || null,
    user: auth.userInfo,
    isAuthorized: auth.isAuthenticated,
    isLoading: auth.loading
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
