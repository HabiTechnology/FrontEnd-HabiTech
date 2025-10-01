"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, User, Home, DollarSign, FileText } from "lucide-react"
import { SolicitudRenta } from "@/types/solicitudes"

interface NuevaSolicitudFormProps {
  onSubmit: (solicitud: Omit<SolicitudRenta, 'id_solicitud'>) => void
}

export default function NuevaSolicitudForm({ onSubmit }: NuevaSolicitudFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    telefono: "",
    departamento_solicitado: "",
    piso_preferido: 1,
    tipo_solicitud: "" as SolicitudRenta["tipo_solicitud"],
    presupuesto_min: 0,
    presupuesto_max: 0,
    comentarios: "",
    score_crediticio: 650
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = "El apellido paterno es requerido"
    if (!formData.email.trim()) newErrors.email = "El email es requerido"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invÃ¡lido"
    if (!formData.telefono.trim()) newErrors.telefono = "El telÃ©fono es requerido"
    if (!formData.tipo_solicitud) newErrors.tipo_solicitud = "El tipo de solicitud es requerido"
    if (formData.presupuesto_min <= 0) newErrors.presupuesto_min = "El presupuesto mÃ­nimo debe ser mayor a 0"
    if (formData.presupuesto_max <= formData.presupuesto_min) newErrors.presupuesto_max = "El presupuesto mÃ¡ximo debe ser mayor al mÃ­nimo"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const nuevaSolicitud: Omit<SolicitudRenta, 'id_solicitud'> = {
      ...formData,
      estado: "Pendiente",
      fecha_solicitud: new Date().toISOString().split('T')[0],
      documentos_completos: Math.random() > 0.3, // SimulaciÃ³n
      referencias_verificadas: Math.random() > 0.5, // SimulaciÃ³n
    }

    onSubmit(nuevaSolicitud)
    
    // Reset form
    setFormData({
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      email: "",
      telefono: "",
      departamento_solicitado: "",
      piso_preferido: 1,
      tipo_solicitud: "" as SolicitudRenta["tipo_solicitud"],
      presupuesto_min: 0,
      presupuesto_max: 0,
      comentarios: "",
      score_crediticio: 650
    })
    setErrors({})
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nueva Solicitud de Renta
        </CardTitle>
        <CardDescription>
          Simula una nueva solicitud enviada por un interesado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* InformaciÃ³n Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="font-semibold">InformaciÃ³n Personal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: MarÃ­a"
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                <Input
                  id="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)}
                  placeholder="Ej: GonzÃ¡lez"
                  className={errors.apellidoPaterno ? "border-red-500" : ""}
                />
                {errors.apellidoPaterno && <p className="text-sm text-red-500 mt-1">{errors.apellidoPaterno}</p>}
              </div>
              <div>
                <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)}
                  placeholder="Ej: PÃ©rez"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="maria.gonzalez@email.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="telefono">TelÃ©fono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className={errors.telefono ? "border-red-500" : ""}
                />
                {errors.telefono && <p className="text-sm text-red-500 mt-1">{errors.telefono}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles de la Solicitud */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <h3 className="font-semibold">Detalles de la Solicitud</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo_solicitud">Tipo de Solicitud *</Label>
                <Select onValueChange={(value) => handleInputChange("tipo_solicitud", value)}>
                  <SelectTrigger className={errors.tipo_solicitud ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Renta">Renta</SelectItem>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Temporal">Temporal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_solicitud && <p className="text-sm text-red-500 mt-1">{errors.tipo_solicitud}</p>}
              </div>
              <div>
                <Label htmlFor="departamento_solicitado">Departamento Preferido</Label>
                <Input
                  id="departamento_solicitado"
                  value={formData.departamento_solicitado}
                  onChange={(e) => handleInputChange("departamento_solicitado", e.target.value)}
                  placeholder="Ej: 201A o 'Cualquiera'"
                />
              </div>
              <div>
                <Label htmlFor="piso_preferido">Piso Preferido</Label>
                <Select onValueChange={(value) => handleInputChange("piso_preferido", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar piso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Piso 1</SelectItem>
                    <SelectItem value="2">Piso 2</SelectItem>
                    <SelectItem value="3">Piso 3</SelectItem>
                    <SelectItem value="4">Piso 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Presupuesto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <h3 className="font-semibold">Presupuesto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="presupuesto_min">Presupuesto MÃ­nimo *</Label>
                <Input
                  id="presupuesto_min"
                  type="number"
                  value={formData.presupuesto_min || ""}
                  onChange={(e) => handleInputChange("presupuesto_min", parseInt(e.target.value) || 0)}
                  placeholder="15000"
                  className={errors.presupuesto_min ? "border-red-500" : ""}
                />
                {errors.presupuesto_min && <p className="text-sm text-red-500 mt-1">{errors.presupuesto_min}</p>}
              </div>
              <div>
                <Label htmlFor="presupuesto_max">Presupuesto MÃ¡ximo *</Label>
                <Input
                  id="presupuesto_max"
                  type="number"
                  value={formData.presupuesto_max || ""}
                  onChange={(e) => handleInputChange("presupuesto_max", parseInt(e.target.value) || 0)}
                  placeholder="25000"
                  className={errors.presupuesto_max ? "border-red-500" : ""}
                />
                {errors.presupuesto_max && <p className="text-sm text-red-500 mt-1">{errors.presupuesto_max}</p>}
              </div>
              <div>
                <Label htmlFor="score_crediticio">Score Crediticio</Label>
                <Input
                  id="score_crediticio"
                  type="number"
                  value={formData.score_crediticio}
                  onChange={(e) => handleInputChange("score_crediticio", parseInt(e.target.value) || 650)}
                  placeholder="650"
                  min="300"
                  max="850"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Entre 300-850 (se genera automÃ¡ticamente si no se especifica)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comentarios */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <h3 className="font-semibold">Comentarios Adicionales</h3>
            </div>
            <div>
              <Label htmlFor="comentarios">Comentarios</Label>
              <Textarea
                id="comentarios"
                value={formData.comentarios}
                onChange={(e) => handleInputChange("comentarios", e.target.value)}
                placeholder="InformaciÃ³n adicional sobre la solicitud, preferencias especiales, etc."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Enviar Solicitud
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
