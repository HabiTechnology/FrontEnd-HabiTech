"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  isAuthorized: boolean
  user: any
  login: () => Promise<void>
  logout: () => void
  isLoading: boolean
  address: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Obtener direcciÃ³n de wallet principal
  const address = wallets.length > 0 ? wallets[0].address : null

  const handleLogout = useCallback(() => {
    logout()
    setIsAuthorized(false)
    sessionStorage.removeItem('habitech_session_active')
    localStorage.removeItem('habitech_authenticated')
    localStorage.removeItem('habitech_user')
    router.push('/login')
  }, [logout, router])

  const handleLogin = useCallback(async () => {
    try {
      await login()
    } catch (error) {

      throw error
    }
  }, [login])

  useEffect(() => {
    if (!ready) {
      setIsLoading(true)
      return
    }

    setIsLoading(false)

    if (authenticated && user && wallets.length > 0) {
      // Para el demo, cualquier wallet conectada estÃ¡ autorizada
      setIsAuthorized(true)
      
      // Guardar datos de sesiÃ³n
      sessionStorage.setItem('habitech_session_active', 'true')
      localStorage.setItem('habitech_authenticated', 'true')
      localStorage.setItem('habitech_user', JSON.stringify({
        wallet: wallets[0].address,
        name: 'Usuario HabiTech',
        role: 'user',
        loginMethod: 'privy'
      }))
    } else {
      setIsAuthorized(false)
      sessionStorage.removeItem('habitech_session_active')
      localStorage.removeItem('habitech_authenticated')
      localStorage.removeItem('habitech_user')
    }
  }, [ready, authenticated, user, wallets])

  const value: AuthContextType = {
    isAuthenticated: ready && authenticated,
    isAuthorized,
    user,
    login: handleLogin,
    logout: handleLogout,
    isLoading,
    address
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
