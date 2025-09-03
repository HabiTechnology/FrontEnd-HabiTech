"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegisterForm } from "@/components/register-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wallet, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()

  // Mock de wallets autorizadas (en producción esto vendría de una base de datos)
  const authorizedWallets = [
    '0x1234567890123456789012345678901234567890', // Ejemplo de wallet autorizada
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Otra wallet de ejemplo
  ]

  const validateWalletAddress = (address: string) => {
    // Validación básica de dirección Ethereum
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    // Mock login function
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const validCredentials = [
      { email: "admin@habitech.com", password: "admin123" },
    ]
    
    const isValid = validCredentials.some(cred => cred.email === email && cred.password === password)
    
    if (isValid) {
      const userRole = 'admin' // Solo admin por formulario
      
      // Establecer autenticación y sesión activa
      localStorage.setItem('habitech_authenticated', 'true')
      sessionStorage.setItem('habitech_session_active', 'true')
      localStorage.setItem('habitech_user', JSON.stringify({
        email,
        name: 'Administrador',
        role: userRole,
        loginMethod: 'form'
      }))
      router.push("/")
    } else {
      setError("Credenciales inválidas. Verifica tu email y contraseña.")
    }
    
    setIsLoading(false)
  }

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (!walletAddress) {
      setError("Por favor ingresa tu dirección de wallet")
      setIsLoading(false)
      return
    }

    if (!validateWalletAddress(walletAddress)) {
      setError("Por favor ingresa una dirección de wallet válida (formato: 0x...)")
      setIsLoading(false)
      return
    }

    const isAuthorized = authorizedWallets.includes(walletAddress.toLowerCase())
    
    if (isAuthorized) {
      // Establecer sesión para wallet
      sessionStorage.setItem('habitech_session_active', 'true')
      localStorage.setItem('habitech_authenticated', 'true')
      localStorage.setItem('habitech_user', JSON.stringify({
        wallet: walletAddress,
        name: 'Residente',
        role: 'resident',
        loginMethod: 'wallet'
      }))
      router.push("/")
    } else {
      setError("Esta wallet no está autorizada. Debes registrarte primero y ser aprobado como residente.")
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
            {[...Array(50)].map((_, i) => {
              const seed = (i + 1) * Math.PI;
              const left = ((seed * 23.456) % 100);
              const top = ((seed * 78.912) % 100);
              const delay = ((seed * 0.95238) % 3);
              
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
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
          {[...Array(50)].map((_, i) => {
            const seed = (i + 1) * Math.PI;
            const left = ((seed * 23.456) % 100);
            const top = ((seed * 78.912) % 100);
            const delay = ((seed * 0.95238) % 3);
            
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
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
            
            <Tabs defaultValue="wallet" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="wallet" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Login para Residentes
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Ingresa tu wallet autorizada para acceder
                    </p>
                  </div>
                  
                  <form onSubmit={handleWalletSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wallet" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                        Dirección de Wallet
                      </Label>
                      <Input
                        id="wallet"
                        type="text"
                        placeholder="0x1234567890123456789012345678901234567890"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] font-mono text-sm"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <Wallet className="w-4 h-4" />
                      {isLoading ? "Verificando..." : "Conectar con Wallet"}
                    </Button>
                  </form>
                  
                  <div className="text-xs text-[#A0AAB4] space-y-1">
                    <p>• Solo wallets autorizadas pueden acceder</p>
                    <p>• Debes estar aprobado como residente</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      <strong>Wallet de prueba:</strong><br />
                      0x1234567890123456789012345678901234567890
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    Solo Administradores
                  </h3>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Acceso exclusivo para personal administrativo
                  </p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1A2E49] dark:text-[#F5F7FA]">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@habitech.com"
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
                
                <div className="text-center">
                  <div className="p-2 bg-[#F5F7FA]/30 dark:bg-[#1A2E49]/30 rounded border border-[#A0AAB4]/20">
                    <strong className="text-[#007BFF]">Admin:</strong> <span className="text-[#A0AAB4]">admin@habitech.com / admin123</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowRegister(true)}
                className="text-sm text-[#007BFF] hover:text-[#0056b3] hover:bg-[#F5F7FA]/50 dark:hover:bg-[#1A2E49]/50"
              >
                ¿Nuevo residente? Solicita tu departamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
