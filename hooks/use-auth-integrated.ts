"use client"

import { usePrivy } from '@privy-io/react-auth'
import { useHabiTechContract } from './use-habitech-contract'
import { useEffect, useState, useCallback, useRef } from 'react'
import { isValidEthereumAddress, generateSecureNonce } from '@/lib/security-validation'

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
  const [sessionNonce, setSessionNonce] = useState<string>('')
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  
  // Referencias para prevenir memory leaks
  const verificationRef = useRef<AbortController | null>(null)
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userAddress = user?.wallet?.address
  
  // Validación de seguridad de la dirección
  const isValidAddress = userAddress ? isValidEthereumAddress(userAddress) : false

  // Función para generar y gestionar sesión segura
  const generateSecureSession = useCallback(() => {
    const nonce = generateSecureNonce()
    setSessionNonce(nonce)
    setLastActivity(Date.now())
    
    // Guardar en sessionStorage de forma segura
    sessionStorage.setItem('habitech_session_nonce', nonce)
    sessionStorage.setItem('habitech_session_start', Date.now().toString())
  }, [])

  // Función para validar sesión activa
  const validateSession = useCallback(() => {
    const now = Date.now()
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 horas
    const ACTIVITY_TIMEOUT = 4 * 60 * 60 * 1000 // 4 horas sin actividad
    
    if (now - lastActivity > ACTIVITY_TIMEOUT) {
      console.log('Sesión expirada por inactividad')
      return false
    }
    
    const sessionStart = sessionStorage.getItem('habitech_session_start')
    if (sessionStart && now - parseInt(sessionStart) > SESSION_TIMEOUT) {
      console.log('Sesión expirada por tiempo límite')
      return false
    }
    
    const storedNonce = sessionStorage.getItem('habitech_session_nonce')
    if (storedNonce !== sessionNonce) {
      console.log('Nonce de sesión inválido')
      return false
    }
    
    return true
  }, [lastActivity, sessionNonce])

  // Función de limpieza de sesión
  const clearSecureSession = useCallback(() => {
    setSessionNonce('')
    setLastActivity(0)
    sessionStorage.removeItem('habitech_session_nonce')
    sessionStorage.removeItem('habitech_session_start')
    localStorage.removeItem('habitech_authenticated')
    localStorage.removeItem('habitech_user')
  }, [])

  useEffect(() => {
    const verifyUser = async () => {
      if (!ready) {
        setLoading(true)
        return
      }

      if (hasChecked) {
        return // Evitar verificaciones múltiples
      }

      if (!authenticated || !userAddress || !isValidAddress) {
        setUserRole(null)
        setUserInfo(null)
        setLoading(false)
        setError(null)
        setHasChecked(true)
        clearSecureSession()
        return
      }

      // Validar sesión existente
      if (sessionNonce && !validateSession()) {
        console.log('Sesión inválida, cerrando sesión')
        logout()
        return
      }

      setLoading(true)
      setError(null)

      // Cancelar verificación anterior si existe
      if (verificationRef.current) {
        verificationRef.current.abort()
      }

      verificationRef.current = new AbortController()

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

        // Verificar si la operación fue cancelada
        if (verificationRef.current?.signal.aborted) {
          return
        }

        setUserRole(role)
        setUserInfo(info)

        // Si el usuario es autorizado, generar sesión segura
        if (role === 'admin' || role === 'resident') {
          if (!sessionNonce) {
            generateSecureSession()
          }
          setLastActivity(Date.now()) // Actualizar actividad
        }

        // Si el usuario está autenticado pero no autorizado, cerrar sesión automáticamente
        if (role === 'unauthorized') {
          console.log('Usuario no autorizado, cerrando sesión automáticamente')
          logout()
          setUserRole(null)
          setUserInfo(null)
          clearSecureSession()
          setError('Tu wallet no tiene permisos para acceder. Por favor, conecta una wallet autorizada.')
        }
        
      } catch (error: any) {
        // No procesar si la operación fue cancelada
        if (verificationRef.current?.signal.aborted) {
          return
        }
        
        console.error('Error verificando usuario:', error)
        setError(error.message || 'Error verificando usuario')
        setUserRole('error')
        clearSecureSession()
        // En caso de error también cerrar sesión para empezar limpio
        logout()
      } finally {
        if (!verificationRef.current?.signal.aborted) {
          setLoading(false)
          setHasChecked(true)
        }
      }
    }

    verifyUser()

    // Cleanup
    return () => {
      if (verificationRef.current) {
        verificationRef.current.abort()
      }
    }
  }, [ready, authenticated, userAddress, isValidAddress, isContractConnected, hasChecked, sessionNonce, validateSession, generateSecureSession, clearSecureSession])

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
      setLoading(true)
      
      // Limpiar sesión anterior antes del nuevo login
      clearSecureSession()
      
      await login()
      
      // Generar nueva sesión después del login exitoso
      generateSecureSession()
      
    } catch (error: any) {
      console.error('Error en login:', error)
      setError(error.message || 'Error durante el login')
      clearSecureSession()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = useCallback(() => {
    // Limpiar timeout si existe
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
    }
    
    // Cancelar verificaciones en progreso
    if (verificationRef.current) {
      verificationRef.current.abort()
    }
    
    // Limpiar estado y sesión
    logout()
    setUserRole(null)
    setUserInfo(null)
    setError(null)
    setHasChecked(false)
    clearSecureSession()
    
    console.log('Sesión cerrada y datos limpiados')
  }, [logout, clearSecureSession])

  // Gestión automática de timeout de sesión
  useEffect(() => {
    if (authenticated && (userRole === 'admin' || userRole === 'resident')) {
      // Configurar timeout automático
      const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutos
      
      sessionTimeoutRef.current = setInterval(() => {
        if (!validateSession()) {
          console.log('Sesión expirada, cerrando automáticamente')
          handleLogout()
        }
      }, ACTIVITY_CHECK_INTERVAL)
      
      return () => {
        if (sessionTimeoutRef.current) {
          clearInterval(sessionTimeoutRef.current)
        }
      }
    }
  }, [authenticated, userRole, validateSession, handleLogout])

  // Actualizar actividad en interacciones del usuario
  const updateActivity = useCallback(() => {
    if (authenticated && (userRole === 'admin' || userRole === 'resident')) {
      setLastActivity(Date.now())
    }
  }, [authenticated, userRole])

  // Listener para actividad del usuario
  useEffect(() => {
    if (authenticated && (userRole === 'admin' || userRole === 'resident')) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      
      const handleActivity = () => {
        updateActivity()
      }
      
      events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true })
      })
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity)
        })
      }
    }
  }, [authenticated, userRole, updateActivity])

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
