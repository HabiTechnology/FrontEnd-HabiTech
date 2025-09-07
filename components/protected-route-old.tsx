"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      // Siempre verificar autenticación fresca (no persistir en recargas)
      const authenticated = localStorage.getItem('habitech_authenticated')
      const sessionActive = sessionStorage.getItem('habitech_session_active')
      const userStr = localStorage.getItem('habitech_user')
      
      // Si no hay sesión activa (recarga de página), redirigir al login
      if (!sessionActive || authenticated !== 'true') {
        setIsAuthenticated(false)
        setIsAuthorized(false)
        // Limpiar localStorage en recargas
        localStorage.removeItem('habitech_authenticated')
        localStorage.removeItem('habitech_user')
        sessionStorage.removeItem('habitech_session_active')
        router.push('/login')
        return
      }

      // Verificar que solo admins puedan acceder
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.role === 'admin') {
            setIsAuthenticated(true)
            setIsAuthorized(true)
          } else {
            // Usuario no es admin, no puede acceder al dashboard
            setIsAuthenticated(true)
            setIsAuthorized(false)
            localStorage.removeItem('habitech_authenticated')
            localStorage.removeItem('habitech_user')
            sessionStorage.removeItem('habitech_session_active')
            router.push('/login')
          }
        } catch {
          setIsAuthenticated(false)
          setIsAuthorized(false)
          router.push('/login')
        }
      } else {
        setIsAuthenticated(false)
        setIsAuthorized(false)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (isAuthenticated === null || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white border-t-4 border-l-4 border-r-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-white font-medium">Verificando permisos...</p>
          <p className="mt-2 text-sm text-white/70">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="text-white text-2xl font-bold mb-4">Acceso Denegado</div>
          <p className="text-white/80 text-lg mb-2">Solo los administradores pueden acceder al dashboard.</p>
          <p className="text-white/60 text-sm">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
