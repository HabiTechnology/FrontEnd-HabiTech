"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RegisterFormProps {
  onBackToLogin: () => void
}

export function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    apartmentNumber: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }
    
    if (!formData.role) {
      setError("Por favor selecciona un rol")
      setIsLoading(false)
      return
    }
    
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simular registro exitoso
    alert("Registro exitoso! Ahora puedes iniciar sesión.")
    onBackToLogin()
    
    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 dark:bg-[#1A2E49]/95 border-[#A0AAB4]/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-[#1A2E49] dark:text-white">
          Crear Cuenta
        </CardTitle>
        <CardDescription className="text-center text-[#A0AAB4]">
          Únete a la comunidad HABITECH
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#1A2E49] dark:text-[#F5F7FA]">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1A2E49] dark:text-[#F5F7FA]">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role" className="text-[#1A2E49] dark:text-[#F5F7FA]">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white focus:border-[#007BFF] focus:ring-[#007BFF]">
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Residente</SelectItem>
                <SelectItem value="security">Seguridad</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.role === "resident" && (
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-[#1A2E49] dark:text-[#F5F7FA]">Número de apartamento</Label>
              <Input
                id="apartment"
                type="text"
                placeholder="Ej: 101, 2A, etc."
                value={formData.apartmentNumber}
                onChange={(e) => handleInputChange("apartmentNumber", e.target.value)}
                required
                className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#1A2E49] dark:text-[#F5F7FA]">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#1A2E49] dark:text-[#F5F7FA]">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirma tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
              className="bg-[#F5F7FA] dark:bg-[#1A2E49]/50 border-[#A0AAB4]/50 text-[#1A2E49] dark:text-white placeholder:text-[#A0AAB4] focus:border-[#007BFF] focus:ring-[#007BFF]"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform transition hover:scale-105 border-0" 
            disabled={isLoading}
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-[#007BFF] hover:text-[#0056b3] underline transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </CardContent>
    </Card>
  )
}