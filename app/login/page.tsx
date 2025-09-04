"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/register-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wallet, Shield, Sparkles, Link } from "lucide-react"

// Declaración de tipos para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      isMetaMask?: boolean
      selectedAddress?: string
      disconnect?: () => Promise<void>
    }
  }
}

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()

  // Solo tu wallet tiene acceso (desde .env)
  const authorizedWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase()

  // Función para desconectar wallet
  const disconnectWallet = async () => {
    try {
      if (window.ethereum && window.ethereum.selectedAddress) {
        // Intentar desconectar si la wallet lo soporta
        if (window.ethereum.disconnect) {
          await window.ethereum.disconnect()
        }
        
        // Limpiar datos locales de sesión
        sessionStorage.removeItem('habitech_session_active')
        localStorage.removeItem('habitech_authenticated')
        localStorage.removeItem('habitech_user')
        
        // Recargar la página para asegurar estado limpio
        window.location.reload()
      }
    } catch (error) {
      console.log("No se pudo desconectar automáticamente, pero se limpiaron los datos locales")
      // Limpiar datos locales aunque no se pueda desconectar
      sessionStorage.removeItem('habitech_session_active')
      localStorage.removeItem('habitech_authenticated')
      localStorage.removeItem('habitech_user')
    }
  }

  // Función para conectar wallet automáticamente
  const connectWallet = async () => {
    // Limpiar error y permitir reintentos
    setError("")
    setIsConnecting(true)
    
    try {
      // Verificar si hay una wallet instalada
      if (typeof window === 'undefined') {
        throw new Error("Window object not available")
      }
      
      if (!window.ethereum) {
        throw new Error("No wallet detected")
      }

      // Solicitar conexión a la wallet
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found")
        }

        const address = accounts[0]
        
        // Verificar automáticamente si es la wallet autorizada
        if (address.toLowerCase() === authorizedWallet) {
          setIsLoading(true)
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          sessionStorage.setItem('habitech_session_active', 'true')
          localStorage.setItem('habitech_authenticated', 'true')
          localStorage.setItem('habitech_user', JSON.stringify({
            wallet: address,
            name: 'Administrador Principal',
            role: 'admin',
            loginMethod: 'wallet'
          }))
          router.push("/")
        } else {
          // Wallet no autorizada - desconectar y mostrar error
          setError("Esta wallet no está autorizada para acceder al sistema. Se desconectará automáticamente. Intenta con otra wallet o cambia de cuenta en MetaMask.")
          
          // Desconectar la wallet no autorizada después de un breve delay
          setTimeout(async () => {
            await disconnectWallet()
          }, 2000)
        }
        
        setIsConnecting(false)
        setIsLoading(false)
      } catch (requestError: any) {
        // Lanzar el error específico de la solicitud para el catch principal
        if (requestError?.code === 4001 || requestError?.message?.includes("User rejected")) {
          throw new Error("User cancelled")
        }
        throw requestError
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      
      // Manejo específico de errores mejorado
      if (error?.code === 4001 || 
          error?.message?.includes("User rejected") || 
          error?.message?.includes("denied") ||
          error?.message === "User cancelled" ||
          (!error || Object.keys(error).length === 0)) {
        setError("Conexión cancelada por el usuario.")
      } else if (error?.message === "No wallet detected") {
        setError("No se detectó ninguna wallet. Por favor instala MetaMask u otra wallet compatible.")
      } else if (error?.code === -32002) {
        setError("Ya hay una solicitud de conexión pendiente. Revisa tu wallet.")
      } else if (error?.message === "No accounts found") {
        setError("No se encontraron cuentas. Asegúrate de estar conectado a tu wallet.")
      } else {
        setError("Error al conectar con la wallet. Verifica que esté instalada y desbloqueada, luego inténtalo de nuevo.")
      }
      
      setIsConnecting(false)
      setIsLoading(false)
    }
  }

  if (showRegister) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ThemeToggle />
        
        {/* Enhanced Background that adapts to theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-primary/80 dark:from-primary/60 dark:via-primary dark:to-primary/60">
          {/* Light mode overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-background/80 dark:from-transparent dark:via-transparent dark:to-transparent" />
          
          {/* Animated Stars */}
          <div className="absolute inset-0">
            {[...Array(75)].map((_, i) => {
              const seed = (i + 1) * Math.PI;
              const left = ((seed * 23.456) % 100);
              const top = ((seed * 78.912) % 100);
              const delay = ((seed * 0.95238) % 4);
              const size = ((seed * 1.234) % 3) + 1;
              
              return (
                <div
                  key={i}
                  className="absolute bg-foreground/80 rounded-full opacity-80 animate-pulse"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                />
              );
            })}
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => {
              const seed = (i + 1) * Math.PI * 2;
              const left = ((seed * 15.789) % 100);
              const top = ((seed * 42.156) % 100);
              const delay = ((seed * 0.333) % 6);
              
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/20 rounded-full animate-bounce"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: '3s',
                  }}
                />
              );
            })}
          </div>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeToggle />
      
      {/* Elegant Minimalist Background that adapts to theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-primary/80 dark:from-primary/60 dark:via-primary dark:to-primary/60">
        {/* Light mode overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/40 to-background/80 dark:from-transparent dark:via-transparent dark:to-transparent" />
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => {
            const seed = (i + 1) * Math.PI;
            const left = ((seed * 23.456) % 70) + 15;
            const top = ((seed * 78.912) % 70) + 15;
            const delay = ((seed * 0.95238) % 8);
            const size = ((seed * 30) % 80) + 60;
            
            return (
              <div
                key={i}
                className="absolute rounded-full opacity-10 dark:opacity-20"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationName: 'float',
                  animationDuration: '8s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${delay}s`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `radial-gradient(circle, rgb(var(--color-primary) / 0.4), rgb(var(--color-primary) / 0.1))`,
                }}
              />
            );
          })}
        </div>

        {/* Elegant grid pattern */}
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgb(var(--color-foreground) / 0.3) 2px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-background/10 dark:from-primary/20 dark:via-transparent dark:to-primary/20" />
      </div>
      
      {/* Main Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md backdrop-blur-2xl bg-card/90 border border-border/40 shadow-2xl rounded-3xl animate-fadeIn hover:scale-[1.02] transition-all duration-700">
          <CardHeader className="space-y-8 text-center pb-10 pt-12">
            {/* Elegant Logo Circle adapts to theme */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center shadow-2xl animate-float relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent rounded-full" />
              <div className="w-8 h-8 bg-background/90 rounded-full animate-pulse-soft" />
            </div>
            
            {/* Elegant Typography adapts to theme */}
            <div className="space-y-4">
              <CardTitle className="text-4xl font-light text-foreground tracking-wider animate-slideDown">
                HABITECH
              </CardTitle>
              <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent animate-expand" />
              <CardDescription className="text-lg text-muted-foreground font-light animate-slideUp tracking-wide">
                Gestión Inteligente • Convivencia Inteligente
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            {/* Error Message - Elegant adapts to theme */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-foreground px-6 py-4 rounded-2xl backdrop-blur-sm animate-shake">
                <p className="text-center font-medium text-sm">{error}</p>
              </div>
            )}
            
            {/* Wallet Access Section */}
            <div className="space-y-6">
              {/* Elegant Header adapts to theme */}
              <div className="text-center">
                <div className="inline-block px-8 py-3 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-full border border-primary/40 backdrop-blur-sm animate-pulse-soft">
                  <span className="text-foreground font-medium text-lg tracking-wide">Acceso Exclusivo por Wallet</span>
                </div>
              </div>

              {/* Main Connect Button - Elegant adapts to theme */}
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    setError("");
                    connectWallet();
                  }}
                  className="w-full h-16 bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary/80 hover:to-primary/90 text-primary-foreground font-medium text-lg tracking-wide flex items-center justify-center gap-4 shadow-2xl hover:shadow-primary/25 transition-all duration-500 rounded-2xl relative overflow-hidden group border border-border/10"
                  disabled={isConnecting}
                >
                  {/* Elegant shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {isConnecting ? (
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="font-light tracking-wider">Conectando...</span>
                    </div>
                  ) : (
                    <span className="relative z-10 font-light tracking-wider">Conectar Wallet</span>
                  )}
                </Button>

                {/* Elegant divider adapts to theme */}
                <div className="flex items-center gap-4 py-1">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-primary/40" />
                  <span className="px-4 py-2 text-muted-foreground text-xs bg-muted/50 rounded-full border border-primary/20 font-light tracking-wide">
                    Método Recomendado
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/40 to-primary/40" />
                </div>
              </div>

              {/* Bottom section - Elegant adapts to theme */}
              <div className="text-center space-y-4">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="text-muted-foreground text-sm font-light tracking-wide">
                  Solo wallets autorizadas tienen acceso al sistema
                </p>
                
                {/* Elegant dots indicator adapts to theme */}
                <div className="flex justify-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Register Button - Elegant adapts to theme */}
            <div className="text-center pt-4 px-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowRegister(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/20 text-xs font-light px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-transparent hover:border-border tracking-wide max-w-full"
              >
                ¿Nuevo residente? Solicita departamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Elegant Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes expand {
          from { width: 0; }
          to { width: 6rem; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-slideDown { animation: slideDown 0.8s ease-out; }
        .animate-slideUp { animation: slideUp 1s ease-out; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-expand { animation: expand 1.2s ease-out; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
