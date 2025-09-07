"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
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

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAuthorized: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  address: null
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy()
  const { wallets } = useWallets()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authUser, setAuthUser] = useState<any>(null)
  const router = useRouter()

  // Sincronizar con el estado de Privy
  useEffect(() => {
    if (!ready) {
      setIsLoading(true)
      return
    }

    setIsLoading(false)

    if (authenticated && user && wallets.length > 0) {
      // Usuario autenticado con Privy y tiene wallet
      const userData = {
        wallet: wallets[0].address,
        name: user.email?.address || user.phone?.number || 'Usuario HabiTech',
        role: 'user',
        loginMethod: 'privy',
        privyUser: user
      }

      setAuthUser(userData)
      setIsAuthenticated(true)
      setIsAuthorized(true)

      // Guardar en localStorage
      localStorage.setItem('habitech_authenticated', 'true')
      localStorage.setItem('habitech_user', JSON.stringify(userData))
      sessionStorage.setItem('habitech_session_active', 'true')
    } else {
      // No autenticado o sin wallet
      setAuthUser(null)
      setIsAuthenticated(false)
      setIsAuthorized(false)
      
      // Limpiar almacenamiento
      localStorage.removeItem('habitech_authenticated')
      localStorage.removeItem('habitech_user')
      sessionStorage.removeItem('habitech_session_active')
    }
  }, [ready, authenticated, user, wallets])

  const login = async () => {
    try {
      setIsLoading(true)
      await privyLogin()
      // El efecto useEffect se encargará de actualizar el estado
    } catch (error) {
      console.error('Error en login con Privy:', error)
      setIsLoading(false)
      throw error
    }
  }

  const logout = () => {
    privyLogout()
    setIsAuthenticated(false)
    setIsAuthorized(false)
    setAuthUser(null)
    
    // Limpiar sesión
    sessionStorage.removeItem('habitech_session_active')
    localStorage.removeItem('habitech_authenticated')
    localStorage.removeItem('habitech_user')
    
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthorized,
        user: authUser,
        login,
        logout,
        isLoading,
        address: authUser?.wallet || null
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
