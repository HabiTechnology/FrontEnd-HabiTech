"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Simulamos los hooks de Privy para desarrollo
const usePrivy = () => ({
  login: () => console.log('Login simulado'),
  logout: () => console.log('Logout simulado'),
  authenticated: false,
  user: null
})

const useWallets = () => ({
  wallets: []
})

interface AuthContextType {
  isAuthenticated: boolean
  isAuthorized: boolean
  user: any
  login: () => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const authorizedWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase()

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
      // Por ahora, simulamos una conexión exitosa
      setIsLoading(true)
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Por ahora, asumimos que el login es exitoso
      setIsAuthorized(true)
      sessionStorage.setItem('habitech_session_active', 'true')
      localStorage.setItem('habitech_authenticated', 'true')
      localStorage.setItem('habitech_user', JSON.stringify({
        wallet: 'demo_wallet',
        name: 'Administrador Principal',
        role: 'admin',
        loginMethod: 'privy_demo'
      }))
      
      router.push('/')
    } catch (error) {
      console.error('Error en login:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    const sessionActive = sessionStorage.getItem('habitech_session_active')
    const authenticated = localStorage.getItem('habitech_authenticated')
    
    if (sessionActive === 'true' && authenticated === 'true') {
      setIsAuthorized(true)
    }
    
    setIsLoading(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        isAuthorized,
        user,
        login: handleLogin,
        logout: handleLogout,
        isLoading
      }}
    >
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
