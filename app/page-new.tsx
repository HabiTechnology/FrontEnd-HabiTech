"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingAnimation from "@/components/animations/loading-animation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Siempre redirigir al login sin importar el estado de autenticaciÃ³n
    const timer = setTimeout(() => {
      router.push("/login")
    }, 2000) // Delay de 2 segundos para mostrar la animaciÃ³n

    return () => clearTimeout(timer)
  }, [router])

  return <LoadingAnimation />
}
