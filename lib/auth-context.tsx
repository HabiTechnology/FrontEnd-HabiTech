"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    const checkAuthorization = () => {
      if (authenticated && user && wallets.length > 0) {
        // Verificar si alguna de las wallets conectadas está autorizada
        const hasAuthorizedWallet = wallets.some(
          wallet => wallet.address.toLowerCase() === authorizedWallet
        )
        
        if (hasAuthorizedWallet) {
          setIsAuthorized(true)
          // Guardar datos de sesión
          sessionStorage.setItem('habitech_session_active', 'true')
          localStorage.setItem('habitech_authenticated', 'true')
          localStorage.setItem('habitech_user', JSON.stringify({
            wallet: wallets[0].address,
            name: 'Administrador Principal',
            role: 'admin',
            loginMethod: 'privy'
          }))
        } else {
          setIsAuthorized(false)
          // Wallet no autorizada - mostrar mensaje y cerrar sesión
          console.warn('Wallet no autorizada conectada')
          setTimeout(() => {
            handleLogout()
          }, 2000)
        }
      } else if (authenticated && user && wallets.length === 0) {
        // Usuario autenticado pero sin wallets - esperar a que se conecten
        setIsAuthorized(false)
      } else {
        setIsAuthorized(false)
        // Limpiar datos de sesión
        sessionStorage.removeItem('habitech_session_active')
        localStorage.removeItem('habitech_authenticated')
        localStorage.removeItem('habitech_user')
      }
      setIsLoading(false)
    }

    checkAuthorization()
  }, [authenticated, user, wallets, authorizedWallet, handleLogout])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        isAuthorized,
        user,
        login,
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
