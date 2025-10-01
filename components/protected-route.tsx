"use client"

import { useAuth } from "@/lib/auth-context-simple-fixed"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthorized, isLoading, logout, error, isContractConnected } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no estÃ¡ autenticado y no estÃ¡ cargando, redirigir al login
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    const contractStatus = isContractConnected ? 'ðŸ”— Consultando blockchain...' : 'ðŸŽ­ Modo demo activo...'
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white border-t-4 border-l-4 border-r-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-white font-medium">Verificando permisos...</p>
          <p className="mt-2 text-sm text-white/70">{contractStatus}</p>
          <p className="mt-1 text-xs text-white/50">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  // Si hay error de autorizaciÃ³n, mostrar mensaje y botÃ³n para reconectar
  if (error && error.includes('no tiene permisos')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49]">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">âš ï¸</div>
          <h2 className="text-2xl text-white font-bold mb-4">Wallet no autorizada</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-white text-[#1A2E49] px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Conectar otra wallet
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    // Mientras redirige, mostrar loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white border-t-4 border-l-4 border-r-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-white font-medium">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
