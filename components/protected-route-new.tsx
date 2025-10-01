"use client"

import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthorized, isLoading } = useAuth()

  if (isLoading) {
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
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.736 0L4.078 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              No tienes permisos para acceder a esta Ã¡rea. Solo usuarios autorizados pueden ingresar al sistema.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-white/90 text-xs">
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
