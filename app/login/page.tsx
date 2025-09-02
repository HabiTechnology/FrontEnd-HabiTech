"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/register-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    // Mock login function
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const validCredentials = [
      { email: "admin@habitech.com", password: "admin123" },
      { email: "residente@habitech.com", password: "residente123" },
      { email: "seguridad@habitech.com", password: "seguridad123" }
    ]
    
    const isValid = validCredentials.some(cred => cred.email === email && cred.password === password)
    
    if (isValid) {
      localStorage.setItem('habitech_authenticated', 'true')
      localStorage.setItem('habitech_user', JSON.stringify({
        email,
        name: email.includes('admin') ? 'Administrador' : 
              email.includes('residente') ? 'Residente' : 'Seguridad',
        role: email.includes('admin') ? 'admin' : 
              email.includes('residente') ? 'resident' : 'security'
      }))
      router.push("/")
    } else {
      setError("Credenciales inválidas. Verifica tu email y contraseña.")
    }
    
    setIsLoading(false)
  }

  if (showRegister) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ThemeToggle />
        
        {/* Background with space theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49] dark:from-[#1A2E49] dark:via-[#007BFF]/80 dark:to-[#1A2E49]">
          {/* Stars */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Register Form */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeToggle />
      
      {/* Background with space theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2E49] via-[#007BFF] to-[#1A2E49] dark:from-[#1A2E49] dark:via-[#007BFF]/80 dark:to-[#1A2E49]">
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 dark:bg-[#1A2E49]/95 border-[#A0AAB4]/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[#1A2E49] dark:text-white">
              HABITECH
            </CardTitle>
            <CardDescription className="text-center text-[#A0AAB4]">
              Gestión Inteligente, Convivencia Inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1A2E49] dark:text-[#F5F7FA]">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1A2E49] dark:text-[#F5F7FA]">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white border-0" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowRegister(true)}
                className="text-sm text-[#007BFF] hover:text-[#0056b3] hover:bg-[#F5F7FA]/50 dark:hover:bg-[#1A2E49]/50"
              >
                ¿No tienes cuenta? Regístrate
              </Button>
            </div>
            
            <div className="mt-6 space-y-2">
              <p className="text-sm text-[#A0AAB4] text-center">Credenciales de demostración:</p>
              <div className="grid gap-2 text-xs">
                <div className="p-2 bg-[#F5F7FA]/30 dark:bg-[#1A2E49]/30 rounded border border-[#A0AAB4]/20">
                  <strong className="text-[#007BFF]">Administrador:</strong> <span className="text-[#A0AAB4]">admin@habitech.com / admin123</span>
                </div>
                <div className="p-2 bg-[#F5F7FA]/30 dark:bg-[#1A2E49]/30 rounded border border-[#A0AAB4]/20">
                  <strong className="text-[#007BFF]">Residente:</strong> <span className="text-[#A0AAB4]">residente@habitech.com / residente123</span>
                </div>
                <div className="p-2 bg-[#F5F7FA]/30 dark:bg-[#1A2E49]/30 rounded border border-[#A0AAB4]/20">
                  <strong className="text-[#007BFF]">Seguridad:</strong> <span className="text-[#A0AAB4]">seguridad@habitech.com / seguridad123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
