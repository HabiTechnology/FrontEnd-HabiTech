"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RegisterFormProps {
  onBackToLogin: () => void
}

export function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    walletAddress: "",
    desiredApartment: "",
    monthlyIncome: "",
    familySize: "1",
    occupation: "",
    message: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateWalletAddress = (address: string) => {
    // Validación básica de dirección Ethereum
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
    
    // Validaciones
    if (!formData.name || !formData.email || !formData.phone || !formData.document) {
      setError("Por favor completa todos los campos obligatorios")
      setIsLoading(false)
      return
    }
    
    if (!formData.walletAddress) {
      setError("La dirección de wallet es obligatoria")
      setIsLoading(false)
      return
    }
    
    if (!validateWalletAddress(formData.walletAddress)) {
      setError("Por favor ingresa una dirección de wallet válida (formato: 0x...)")
      setIsLoading(false)
      return
    }
    
    if (!formData.desiredApartment) {
      setError("Por favor selecciona un tipo de apartamento")
      setIsLoading(false)
      return
    }
    
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simular registro exitoso
    setSuccess(`¡Solicitud enviada exitosamente! 
    
Tu solicitud ha sido registrada con la wallet: ${formData.walletAddress}

Un administrador revisará tu solicitud y te contactará pronto. Una vez aprobado, podrás iniciar sesión con tu wallet.`)
    
    // Limpiar formulario
    setFormData({
      name: "",
      email: "",
      phone: "",
      document: "",
      walletAddress: "",
      desiredApartment: "",
      monthlyIncome: "",
      familySize: "1",
      occupation: "",
      message: ""
    })
    
    setIsLoading(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/95 dark:bg-[#1A2E49]/95 border-[#A0AAB4]/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            ¡Solicitud Enviada!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <pre className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap">
              {success}
            </pre>
          </div>
          <Button 
            onClick={onBackToLogin}
            className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white"
          >
            Volver al Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/95 dark:bg-[#1A2E49]/95 border-[#A0AAB4]/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-[#1A2E49] dark:text-white">
          Solicitud de Departamento
        </CardTitle>
        <CardDescription className="text-center text-[#A0AAB4]">
          Completa tus datos para aplicar a un departamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Nombre Completo *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Teléfono *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+51 999 999 999"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                DNI/Documento *
              </Label>
              <Input
                id="document"
                type="text"
                placeholder="12345678"
                value={formData.document}
                onChange={(e) => handleInputChange("document", e.target.value)}
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-[#1A2E49] dark:text-[#F5F7FA]">
              Dirección de Wallet * 
              <span className="text-sm text-[#A0AAB4] ml-2">(Esta será tu forma de acceso una vez aprobado)</span>
            </Label>
            <Input
              id="wallet"
              type="text"
              placeholder="0x1234567890123456789012345678901234567890"
              value={formData.walletAddress}
              onChange={(e) => handleInputChange("walletAddress", e.target.value)}
              className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] font-mono text-sm"
              required
            />
            <p className="text-xs text-[#A0AAB4]">
              💡 Tip: Puedes obtener tu dirección desde MetaMask, Trust Wallet, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Tipo de Departamento *
              </Label>
              <Select value={formData.desiredApartment} onValueChange={(value) => handleInputChange("desiredApartment", value)}>
                <SelectTrigger className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio (1 baño) - S/ 800/mes</SelectItem>
                  <SelectItem value="2bed-1bath">2 dormitorios, 1 baño - S/ 1,200/mes</SelectItem>
                  <SelectItem value="2bed-2bath">2 dormitorios, 2 baños - S/ 1,300/mes</SelectItem>
                  <SelectItem value="3bed-2bath">3 dormitorios, 2 baños - S/ 1,500/mes</SelectItem>
                  <SelectItem value="penthouse">Penthouse - S/ 1,800/mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Ingresos Mensuales
              </Label>
              <Input
                id="income"
                type="text"
                placeholder="S/ 3,000"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="family" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Tamaño de Familia
              </Label>
              <Select value={formData.familySize} onValueChange={(value) => handleInputChange("familySize", value)}>
                <SelectTrigger className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 persona</SelectItem>
                  <SelectItem value="2">2 personas</SelectItem>
                  <SelectItem value="3">3 personas</SelectItem>
                  <SelectItem value="4">4 personas</SelectItem>
                  <SelectItem value="5+">5+ personas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-[#1A2E49] dark:text-[#F5F7FA]">
                Ocupación
              </Label>
              <Input
                id="occupation"
                type="text"
                placeholder="Ingeniero, Doctor, etc."
                value={formData.occupation}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#1A2E49] dark:text-[#F5F7FA]">
              Mensaje adicional
            </Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos por qué quieres vivir aquí..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4]"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white border-0" 
            disabled={isLoading}
          >
            {isLoading ? "Enviando solicitud..." : "Enviar Solicitud"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={onBackToLogin}
            className="text-sm text-[#007BFF] hover:text-[#0056b3] hover:bg-[#F5F7FA]/50 dark:hover:bg-[#1A2E49]/50"
          >
            ← Volver al login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
