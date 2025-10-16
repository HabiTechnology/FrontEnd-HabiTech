"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Calendar, FileText, User, AlertCircle, CheckCircle2, Loader2, Plus, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Residente {
  id: number
  nombre_completo: string
  correo: string
  numero_departamento: string
  piso: number
}

interface CrearPagoMejoradoProps {
  onPagoCreado?: () => void
}

export default function CrearPagoMejorado({ onPagoCreado }: CrearPagoMejoradoProps) {
  const { toast } = useToast()
  const [residentes, setResidentes] = useState<Residente[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingResidentes, setLoadingResidentes] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    residente_id: "",
    tipo_pago: "",
    monto: "",
    fecha_vencimiento: "",
    descripcion: "",
    recargo: "0.00",
    metodo_pago: "",
    estado: "pendiente"
  })

  useEffect(() => {
    fetchResidentes()
  }, [])

  const fetchResidentes = async () => {
    try {
      setLoadingResidentes(true)
      const response = await fetch('/api/residentes?activos=true')
      const data = await response.json()
      
      const residentesFormateados = data
        .filter((r: any) => r.departamento && r.usuario)
        .map((r: any) => ({
          id: r.id,
          nombre_completo: `${r.usuario.nombre} ${r.usuario.apellido}`,
          correo: r.usuario.correo,
          numero_departamento: r.departamento.numero,
          piso: r.departamento.piso
        }))
      
      setResidentes(residentesFormateados)
    } catch (error) {
      console.error("❌ Error fetching residentes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los residentes",
        variant: "destructive"
      })
    } finally {
      setLoadingResidentes(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.residente_id || !formData.tipo_pago || !formData.monto || !formData.fecha_vencimiento || !formData.descripcion) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      })
      return
    }

    const monto = parseFloat(formData.monto)
    const recargo = parseFloat(formData.recargo)
    
    if (isNaN(monto) || monto <= 0) {
      toast({
        title: "Monto inválido",
        description: "El monto debe ser mayor a 0",
        variant: "destructive"
      })
      return
    }

    if (isNaN(recargo) || recargo < 0) {
      toast({
        title: "Recargo inválido",
        description: "El recargo no puede ser negativo",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/financiero/crear-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          residente_id: parseInt(formData.residente_id),
          tipo_pago: formData.tipo_pago,
          monto: monto,
          fecha_vencimiento: formData.fecha_vencimiento,
          descripcion: formData.descripcion,
          recargo: recargo,
          metodo_pago: formData.metodo_pago || null,
          estado: formData.estado
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago')
      }

      toast({
        title: "✅ Pago creado exitosamente",
        description: `Se ha generado el pago para ${residentes.find(r => r.id.toString() === formData.residente_id)?.nombre_completo}`,
      })

      // Reset form
      setFormData({
        residente_id: "",
        tipo_pago: "",
        monto: "",
        fecha_vencimiento: "",
        descripcion: "",
        recargo: "0.00",
        metodo_pago: "",
        estado: "pendiente"
      })

      // Callback
      if (onPagoCreado) {
        onPagoCreado()
      }

    } catch (error) {
      console.error("❌ Error creating payment:", error)
      toast({
        title: "Error al crear pago",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const residenteSeleccionado = residentes.find(r => r.id.toString() === formData.residente_id)
  const mostrarVistaPreviaCompleta = formData.residente_id && formData.tipo_pago && formData.monto && formData.fecha_vencimiento

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r text-white">
        <div className="flex items-center gap-2">
          <Plus className="h-6 w-6" />
          <div>
            <CardTitle>Generar Nuevo Pago</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Seleccionar Residente */}
          <div className="space-y-2">
            <Label htmlFor="residente" className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Residente <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.residente_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, residente_id: value }))}
              disabled={loadingResidentes}
            >
              <SelectTrigger id="residente">
                <SelectValue placeholder={loadingResidentes ? "Cargando residentes..." : "Selecciona un residente"} />
              </SelectTrigger>
              <SelectContent>
                {residentes.map((residente) => (
                  <SelectItem key={residente.id} value={residente.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{residente.nombre_completo}</span>
                      <span className="text-xs text-muted-foreground">
                        Depto {residente.numero_departamento} - Piso {residente.piso}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Pago */}
          <div className="space-y-2">
            <Label htmlFor="tipo_pago" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Tipo de Pago <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tipo_pago}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_pago: value }))}
            >
              <SelectTrigger id="tipo_pago">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renta">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Renta
                  </div>
                </SelectItem>
                <SelectItem value="mantenimiento">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Mantenimiento
                  </div>
                </SelectItem>
                <SelectItem value="multa">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Multa
                  </div>
                </SelectItem>
                <SelectItem value="deposito">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    Depósito
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Monto y Recargo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Monto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recargo" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Recargo (opcional)
              </Label>
              <Input
                id="recargo"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.recargo}
                onChange={(e) => setFormData(prev => ({ ...prev, recargo: e.target.value }))}
              />
            </div>
          </div>

          {/* Fecha de Vencimiento */}
          <div className="space-y-2">
            <Label htmlFor="fecha_vencimiento" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Fecha de Vencimiento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha_vencimiento"
              type="date"
              min={today}
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Fecha límite para que el residente realice el pago
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Pago de renta correspondiente a Enero 2025"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Método de Pago y Estado */}
          <div className="grid grid-cols-2 gap-4">
            {/* Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="metodo_pago" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Método de Pago
              </Label>
              <Select
                value={formData.metodo_pago || undefined}
                onValueChange={(value) => setFormData(prev => ({ ...prev, metodo_pago: value }))}
              >
                <SelectTrigger id="metodo_pago">
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Transferencia Bancaria
                    </div>
                  </SelectItem>
                  <SelectItem value="tarjeta">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Tarjeta
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pago en Línea
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado del Pago */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Estado del Pago
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value="pagado">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Pagado
                    </div>
                  </SelectItem>
                  <SelectItem value="atrasado">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Atrasado
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelado">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
                      Cancelado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vista Previa */}
          {mostrarVistaPreviaCompleta && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Vista Previa del Pago
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Residente:</span>
                  <span className="font-medium">{residenteSeleccionado?.nombre_completo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departamento:</span>
                  <span className="font-medium">
                    {residenteSeleccionado?.numero_departamento} - Piso {residenteSeleccionado?.piso}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">{formData.tipo_pago}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="font-bold text-blue-600">
                    ${parseFloat(formData.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {parseFloat(formData.recargo) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recargo:</span>
                    <span className="font-bold text-orange-600">
                      +${parseFloat(formData.recargo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg text-blue-700">
                    ${(parseFloat(formData.monto) + parseFloat(formData.recargo || '0')).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vence:</span>
                  <span className="font-medium text-red-600">
                    {new Date(formData.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {formData.metodo_pago && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método de Pago:</span>
                    <Badge variant="outline" className="capitalize">
                      {formData.metodo_pago}
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Estado inicial:</span>
                  <Badge className={
                    formData.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    formData.estado === 'pagado' ? 'bg-green-100 text-green-800 border-green-300' :
                    formData.estado === 'atrasado' ? 'bg-red-100 text-red-800 border-red-300' :
                    'bg-gray-100 text-gray-800 border-gray-300'
                  }>
                    {formData.estado.charAt(0).toUpperCase() + formData.estado.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando pago...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Generar Pago
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
