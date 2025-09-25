"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context-simple-fixed'
import LoadingAnimation from '@/components/animations/loading-animation'
import { Shield, AlertTriangle, Wifi, WifiOff } from 'lucide-react'

interface SecureRouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'resident' | 'any'
  fallbackPath?: string
  enableOfflineMode?: boolean
}

export function SecureRouteGuard({ 
  children, 
  requiredRole = 'any',
  fallbackPath = '/login',
  enableOfflineMode = false
}: SecureRouteGuardProps) {
  const { 
    isAuthenticated, 
    userRole, 
    loading, 
    error, 
    isAdmin, 
    isResident,
    isContractConnected 
  } = useAuth()
  
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [securityCheck, setSecurityCheck] = useState({
    passed: false,
    checking: true,
    errors: [] as string[]
  })

  // Detectar conexión online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Verificaciones de seguridad
  useEffect(() => {
    const performSecurityChecks = () => {
      const errors: string[] = []
      
      // 1. Verificar HTTPS en producción
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        if (window.location.protocol !== 'https:') {
          errors.push('Conexión insegura detectada. Usar HTTPS.')
        }
      }
      
      // 2. Verificar integridad de la sesión
      const sessionNonce = sessionStorage.getItem('habitech_session_nonce')
      const sessionStart = sessionStorage.getItem('habitech_session_start')
      
      if (isAuthenticated && (!sessionNonce || !sessionStart)) {
        errors.push('Integridad de sesión comprometida.')
      }
      
      // 3. Verificar conexión al contrato (si no está en modo offline)
      if (!enableOfflineMode && isAuthenticated && !isContractConnected) {
        errors.push('Conexión al blockchain no disponible.')
      }
      
      // 4. Verificar permisos de rol
      if (isAuthenticated && requiredRole !== 'any') {
        if (requiredRole === 'admin' && !isAdmin) {
          errors.push('Permisos de administrador requeridos.')
        }
        if (requiredRole === 'resident' && !isResident) {
          errors.push('Permisos de residente requeridos.')
        }
      }
      
      // 5. Verificar tamper del localStorage
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('habitech_authenticated')
        if (authData && !['true', 'false'].includes(authData)) {
          errors.push('Datos de autenticación alterados.')
          localStorage.clear()
          sessionStorage.clear()
        }
      }
      
      setSecurityCheck({
        passed: errors.length === 0,
        checking: false,
        errors
      })
      
      // Si hay errores críticos de seguridad, redirigir
      if (errors.length > 0) {
        console.error('🔒 Fallos de seguridad detectados:', errors)
        
        // Solo redirigir si no está en modo offline y hay errores críticos
        const criticalErrors = errors.filter(error => 
          error.includes('alterados') || 
          error.includes('Permisos') || 
          error.includes('sesión comprometida')
        )
        
        if (criticalErrors.length > 0) {
          router.push(fallbackPath)
        }
      }
    }
    
    if (!loading) {
      performSecurityChecks()
    }
  }, [isAuthenticated, userRole, loading, isContractConnected, isAdmin, isResident, requiredRole, enableOfflineMode, router, fallbackPath])

  // Mostrar loading durante verificaciones iniciales
  if (loading || securityCheck.checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto animate-pulse text-blue-500" />
          <LoadingAnimation />
          <p className="text-sm text-muted-foreground">
            Verificando seguridad...
          </p>
        </div>
      </div>
    )
  }

  // Mostrar errores si no están autenticados
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-6 p-6 bg-card rounded-lg border border-border">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
            <h2 className="mt-4 text-xl font-semibold">Acceso Restringido</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Debes iniciar sesión para acceder a esta página.
            </p>
          </div>
          
          <button
            onClick={() => router.push(fallbackPath)}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 px-4 hover:bg-primary/90 transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    )
  }

  // Mostrar errores de seguridad si los hay
  if (!securityCheck.passed && securityCheck.errors.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-6 p-6 bg-card rounded-lg border border-destructive">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="mt-4 text-xl font-semibold text-destructive">
              Problemas de Seguridad Detectados
            </h2>
          </div>
          
          <div className="space-y-2">
            {securityCheck.errors.map((error, index) => (
              <div key={index} className="p-3 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-primary text-primary-foreground rounded-md py-2 px-4 hover:bg-primary/90 transition-colors text-sm"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex-1 bg-secondary text-secondary-foreground rounded-md py-2 px-4 hover:bg-secondary/90 transition-colors text-sm"
            >
              Nuevo Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar indicador de conexión si está offline
  const connectionIndicator = (
    <div className={`fixed top-4 right-4 z-50 p-2 rounded-md text-xs flex items-center gap-2 ${
      isOnline 
        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
        : 'bg-red-500/10 text-red-500 border border-red-500/20'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          Conexión Segura
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          {enableOfflineMode ? 'Modo Offline' : 'Sin Conexión'}
        </>
      )}
    </div>
  )

  // Mostrar indicador de error si hay problemas
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-6 p-6 bg-card rounded-lg border border-destructive">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="mt-4 text-xl font-semibold text-destructive">
              Error de Autenticación
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
          </div>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 px-4 hover:bg-primary/90 transition-colors"
          >
            Iniciar Sesión Nuevamente
          </button>
        </div>
      </div>
    )
  }

  // Todo bien, mostrar contenido protegido
  return (
    <>
      {connectionIndicator}
      {children}
    </>
  )
}

// Hook personalizado para usar el guard
export function useSecurityStatus() {
  const { isAuthenticated, userRole, isContractConnected } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return {
    isSecure: isAuthenticated && isContractConnected,
    isOnline,
    userRole,
    hasBlockchainConnection: isContractConnected
  }
}