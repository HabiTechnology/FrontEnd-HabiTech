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
    }
  }
}

export default function LoginPage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()

  // Solo tu wallet tiene acceso (desde .env)
  const authorizedWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase()

  const validateWalletAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Función para conectar wallet automáticamente
  const connectWallet = async () => {
    try {
      setError("")
      setIsConnecting(true)

      // Verificar si hay una wallet instalada
      if (typeof window !== 'undefined' && window.ethereum) {
        // Solicitar conexión a la wallet
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })

        if (accounts.length > 0) {
          const address = accounts[0]
          setWalletAddress(address)
          
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
            setError("Esta wallet no está autorizada para acceder al sistema.")
          }
        }
      } else {
        setError("No se detectó ninguna wallet. Por favor instala MetaMask o usa el ingreso manual.")
      }
      
      setIsConnecting(false)
      setIsLoading(false)
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        setError("Conexión cancelada por el usuario.")
      } else {
        setError("Error al conectar con la wallet. Inténtalo de nuevo.")
      }
      setIsConnecting(false)
      setIsLoading(false)
    }
  }

  const handleWalletLogin = async () => {
    try {
      setError("")
      setIsLoading(true)
      
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
      
      // Simular conexión con wallet
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (walletAddress.toLowerCase() === authorizedWallet) {
        sessionStorage.setItem('habitech_session_active', 'true')
        localStorage.setItem('habitech_authenticated', 'true')
        localStorage.setItem('habitech_user', JSON.stringify({
          wallet: walletAddress,
          name: 'Administrador Principal',
          role: 'admin',
          loginMethod: 'wallet'
        }))
        router.push("/")
      } else {
        setError("Acceso denegado. Esta wallet no está autorizada para acceder al sistema.")
      }
      
      setIsLoading(false)
    } catch (error) {
      setError("Error al verificar la wallet. Por favor, inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  if (showRegister) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ThemeToggle />
        
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#1B4D83] via-[#007BFF] to-[#0D1B2A]">
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
                  className="absolute bg-white rounded-full opacity-80 animate-pulse"
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
                  className="absolute w-2 h-2 bg-blue-300/20 rounded-full animate-bounce"
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
      
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#1B4D83] via-[#007BFF] to-[#0D1B2A]">
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
                className="absolute bg-white rounded-full opacity-80 animate-pulse"
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
                className="absolute w-2 h-2 bg-blue-300/20 rounded-full animate-bounce"
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
      
      {/* Main Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#007BFF] to-[#0056b3] rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              HABITECH
            </CardTitle>
            <CardDescription className="text-lg text-blue-100">
              Gestión Inteligente, Convivencia Inteligente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}
            
            {/* Wallet Access Section */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-blue-300" />
                  <span className="text-blue-100 font-semibold text-lg">Acceso Exclusivo por Wallet</span>
                </div>
              </div>

              {/* BOTÓN PRINCIPAL PARA CONECTAR WALLET - MUY VISIBLE */}
              <div className="space-y-4">
                <Button 
                  onClick={connectWallet}
                  className="w-full h-20 bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 hover:from-green-500 hover:via-green-600 hover:to-emerald-700 text-white font-black text-2xl flex items-center justify-center gap-4 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 border-2 border-green-300/50 rounded-xl"
                  disabled={isConnecting || isLoading}
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white"></div>
                      <span className="text-xl">CONECTANDO...</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-8 h-8" />
                      <span>🚀 CONECTAR WALLET 🚀</span>
                    </>
                  )}
                </Button>

                <div className="text-center py-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-400/50 to-green-400/50"></div>
                    <span className="px-4 py-2 text-green-200 text-sm bg-green-900/30 rounded-full border border-green-400/30 font-semibold">
                      ⬆️ RECOMENDADO ⬆️
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-green-400/50 to-green-400/50"></div>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-white/30"></div>
                  <span className="px-4 py-2 text-blue-200 text-sm bg-[#0D1B2A]/80 rounded-full border border-white/20">
                    o ingresa dirección manualmente
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/30 to-white/30"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-white font-medium text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Dirección de Wallet Autorizada
                  </Label>
                  <Input
                    id="wallet"
                    type="text"
                    placeholder="0x1234567890123456789012345678901234567890"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-200 font-mono text-sm h-12 backdrop-blur-sm focus:border-blue-400 focus:ring-blue-400/50"
                    required
                  />
                </div>
                
                <Button 
                  onClick={handleWalletLogin}
                  className="w-full h-14 bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004494] text-white font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading || isConnecting}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verificando Acceso...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Acceder con Dirección Manual
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <p className="text-blue-100/80 text-sm">
                  Solo wallets autorizadas pueden acceder al sistema
                </p>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowRegister(true)}
                className="text-blue-200 hover:text-white hover:bg-white/10 text-base font-medium"
              >
                ¿Nuevo residente? Solicita tu departamento →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
