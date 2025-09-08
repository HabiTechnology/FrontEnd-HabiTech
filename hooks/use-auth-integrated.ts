"use client"

import { usePrivy } from '@privy-io/react-auth'
import { useHabiTechContract } from './use-habitech-contract'
import { useEffect, useState } from 'react'

export type UserRole = 'admin' | 'resident' | 'unauthorized' | 'error' | null

interface UserInfo {
  wallet: string
  name: string
  email: string
  isActive: boolean
  registeredAt: bigint
  userType: number
}

export function useAuth() {
  const { user, authenticated, login, logout, ready } = usePrivy()
  const { checkUserRole, getUserInfo, isContractConnected } = useHabiTechContract()
  
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  const userAddress = user?.wallet?.address

  useEffect(() => {
    const verifyUser = async () => {
      if (!ready) {
        setLoading(true)
        return
      }

      if (hasChecked) {
        return // Evitar verificaciones múltiples
      }

      if (!authenticated || !userAddress) {
        setUserRole(null)
        setUserInfo(null)
        setLoading(false)
        setError(null)
        setHasChecked(true)
        return
      }

      setLoading(true)
      setError(null)

      // Verificar que el contrato esté conectado
      if (!isContractConnected) {
        console.error('❌ Contrato no conectado. Verificar configuración.')
        setError('Error: Contrato no disponible. Verificar configuración de red.')
        setUserRole('error')
        setLoading(false)
        setHasChecked(true)
        return
      }

      try {
        const [role, info] = await Promise.all([
          checkUserRole(userAddress),
          getUserInfo(userAddress)
        ])

        setUserRole(role)
        setUserInfo(info)

        // Si el usuario está autenticado pero no autorizado, cerrar sesión automáticamente
        if (role === 'unauthorized') {
          console.log('Usuario no autorizado, cerrando sesión automáticamente')
          logout()
          setUserRole(null)
          setUserInfo(null)
          setError('Tu wallet no tiene permisos para acceder. Por favor, conecta una wallet autorizada.')
        }
        
      } catch (error: any) {
        console.error('Error verificando usuario:', error)
        setError(error.message || 'Error verificando usuario')
        setUserRole('error')
        // En caso de error también cerrar sesión para empezar limpio
        logout()
      } finally {
        setLoading(false)
        setHasChecked(true)
      }
    }

    verifyUser()
  }, [ready, authenticated, userAddress, isContractConnected, hasChecked])

  // Reset hasChecked when authentication state changes
  useEffect(() => {
    setHasChecked(false)
  }, [authenticated, userAddress])

  // Auto-logout when user is unauthorized after being authenticated
  useEffect(() => {
    if (authenticated && userRole === 'unauthorized' && !loading) {
      console.log('Auto-logout: Usuario autenticado pero no autorizado')
      logout()
    }
  }, [authenticated, userRole, loading, logout])

  const handleLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (error: any) {
      console.error('Error en login:', error)
      setError(error.message || 'Error durante el login')
    }
  }

  const handleLogout = () => {
    logout()
    setUserRole(null)
    setUserInfo(null)
    setError(null)
    setHasChecked(false)
  }

  return {
    // Estado de autenticación
    isAuthenticated: authenticated && (userRole === 'admin' || userRole === 'resident'),
    userRole,
    userInfo,
    userAddress,
    loading,
    error,
    
    // Estado de Privy
    ready,
    authenticated,
    
    // Funciones
    login: handleLogin,
    logout: handleLogout,
    
    // Estado del contrato
    isContractConnected,
    
    // Estado derivado
    isAdmin: userRole === 'admin',
    isResident: userRole === 'resident',
    isUnauthorized: userRole === 'unauthorized'
  }
}
