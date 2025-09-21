"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Siempre redirigir al login sin importar el estado de autenticación
    router.push("/login")
  }, [router])

  // Mostrar loading mientras redirige
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirigiendo al login...</p>
      </div>
    </div>
  )
}