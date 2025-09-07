"use client"

import { useAuth } from "@/lib/auth-context-simple-fixed"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthorized, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir al login
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

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
