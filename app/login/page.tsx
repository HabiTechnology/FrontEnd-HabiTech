"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RegisterForm } from "@/components/register-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wallet, Shield, Sparkles, AlertCircle, CheckCircle, Users, UserCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context-simple-fixed"
import { PrivyLoginButton } from "@/components/privy-login-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PageTransition from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import FloatingElement from "@/components/animations/floating-element"
import AnimatedButton from "@/components/animations/animated-button"
import FormularioSolicitudRentaModal from "@/components/solicitud-renta/formulario-solicitud-renta-modal"

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false)
  const [showSolicitudRenta, setShowSolicitudRenta] = useState(false)
  const [error, setError] = useState("")
  const { 
    isAuthenticated, 
    userRole, 
    userInfo,
    login, 
    logout,
    loading, 
    error: authError,
    isAdmin,
    isResident,
    isUnauthorized 
  } = useAuth()
  const router = useRouter()

  // Limpiar sesión si hay usuario no autorizado al cargar la página
  useEffect(() => {
    if (isUnauthorized || (isAuthenticated && userRole === 'unauthorized')) {
      console.log('Limpiando sesión de usuario no autorizado en login')
      logout()
    }
  }, [isUnauthorized, isAuthenticated, userRole, logout])

  // Redirigir si ya está autenticado y autorizado
  useEffect(() => {
    if (isAuthenticated && (userRole === 'admin' || userRole === 'resident')) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, userRole, router])

  // Mostrar errores de autenticación
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleLogin = async () => {
    setError("")
    try {
      await login()
    } catch (error: any) {
      console.error("Error during login:", error)
      setError("Error al conectar con la wallet. Inténtalo de nuevo.")
    }
  }

  // Renderizar estado de rol cuando está autenticado pero no autorizado
  const renderRoleStatus = () => {
    if (!isAuthenticated) return null

    if (loading) {
      return (
        <Alert className="mb-4">
          <Sparkles className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Verificando rol en blockchain...
          </AlertDescription>
        </Alert>
      )
    }

    if (isUnauthorized) {
      return (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Tu wallet no está registrada en el sistema. Contacta al administrador para obtener acceso.
          </AlertDescription>
        </Alert>
      )
    }

    if (isAdmin) {
      return (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ Acceso de Administrador verificado. Redirigiendo...
          </AlertDescription>
        </Alert>
      )
    }

    if (isResident) {
      return (
        <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            ✅ Acceso de Residente verificado. Redirigiendo...
          </AlertDescription>
        </Alert>
      )
    }

    return null
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
    <PageTransition>
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
              <FloatingElement key={i} intensity={8} duration={4000 + (i * 500)}>
                <div
                  className="absolute rounded-full bg-primary/10 dark:bg-primary/5 backdrop-blur-md"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                  }}
                />
              </FloatingElement>
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
        <StaggerAnimation delay={300} staggerDelay={150}>
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
              <Alert className="border-destructive/50 text-destructive bg-destructive/10 animate-shake">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Role Status */}
            {renderRoleStatus()}
            
            {/* Wallet Access Section */}
            <div className="space-y-6">
              {/* Elegant Header adapts to theme */}
              <div className="text-center">
                <div className="inline-block px-8 py-3 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-full border border-primary/40 backdrop-blur-sm animate-pulse-soft">
                  <span className="text-foreground font-medium text-lg tracking-wide">Acceso Exclusivo por Wallet</span>
                </div>
              </div>

              {/* Main Connect Button - Privy Integration */}
              <div className="space-y-4">
                <AnimatedButton variant="hover">
                  <PrivyLoginButton />
                </AnimatedButton>

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
                onClick={() => setShowSolicitudRenta(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/20 text-xs font-light px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-transparent hover:border-border tracking-wide max-w-full"
              >
                ¿Nuevo residente? Solicita departamento
              </Button>
            </div>
          </CardContent>
        </Card>
        </StaggerAnimation>
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

      {/* Modal de Solicitud de Renta */}
      <Dialog open={showSolicitudRenta} onOpenChange={setShowSolicitudRenta}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold text-center">
              Solicitud de Departamento
            </DialogTitle>
            <DialogDescription className="text-center">
              Complete el formulario para solicitar el arriendo de un departamento
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            <FormularioSolicitudRentaModal 
              onSuccess={() => setShowSolicitudRenta(false)}
              onCancel={() => setShowSolicitudRenta(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
