"use client"

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Wallet, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function PrivyLoginButton() {
  const { ready, authenticated, login, user } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated && user) {
      // Usuario autenticado exitosamente, redirigir al dashboard
      router.push('/dashboard')
    }
  }, [ready, authenticated, user, router])

  const handleLogin = async () => {
    try {
      await login()
    } catch (error) {

    }
  }

  if (!ready) {
    return (
      <Button 
        disabled 
        className="w-full h-16 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground font-medium text-lg tracking-wide flex items-center justify-center gap-4 shadow-2xl rounded-2xl border border-border/10"
      >
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span className="font-light tracking-wider">Cargando Privy...</span>
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleLogin}
      className="w-full h-16 bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary/80 hover:to-primary/90 text-primary-foreground font-medium text-lg tracking-wide flex items-center justify-center gap-4 shadow-2xl hover:shadow-primary/25 transition-all duration-500 rounded-2xl relative overflow-hidden group border border-border/10"
    >
      {/* Elegant shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="flex items-center gap-4">
        <Wallet className="h-6 w-6" />
        <span className="relative z-10 font-light tracking-wider">Conectar con Privy</span>
      </div>
    </Button>
  )
}
