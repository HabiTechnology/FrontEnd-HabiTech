"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, CheckCircle2, Loader2, Hash, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Pago {
  id: number
  tipo_pago: string
  monto: number
  fecha_vencimiento: string
  descripcion: string
  estado: string
  recargo: number
  residente: {
    nombre: string
    apellido: string
  }
  departamento: {
    numero: string
    piso: number
  }
}

interface RegistrarPagoModalProps {
  pago: Pago | null
  isOpen: boolean
  onClose: () => void
  onPagoRegistrado: () => void
}

export default function RegistrarPagoModal({ 
  pago, 
  isOpen, 
  onClose, 
  onPagoRegistrado 
}: RegistrarPagoModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    metodo_pago: "",
    id_transaccion: "",
    fecha_pago: new Date().toISOString().split('T')[0]
  })

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔵 Modal abierto, reseteando formulario')
      setFormData({
        metodo_pago: "",
        id_transaccion: "",
        fecha_pago: new Date().toISOString().split('T')[0]
      })
    }
  }, [isOpen])

  if (!pago) return null

  const totalAPagar = pago.monto + (pago.recargo || 0)

  const handleRegistrar = async () => {
    console.log('🔵 handleRegistrar llamado')
    console.log('📝 formData:', formData)
    
    if (!formData.metodo_pago) {
      console.log('❌ Método de pago vacío')
      toast({
        title: "Campo requerido",
        description: "Debes seleccionar un método de pago",
        variant: "destructive"
      })
      return
    }

    if (!formData.fecha_pago) {
      console.log('❌ Fecha de pago vacía')
      toast({
        title: "Campo requerido",
        description: "Debes ingresar la fecha de pago",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      console.log('📤 Enviando request a API...')
      console.log('🔗 URL:', `/api/financiero/registrar-pago/${pago.id}`)
      console.log('📦 Body:', {
        metodo_pago: formData.metodo_pago,
        fecha_pago: formData.fecha_pago,
        id_transaccion: formData.id_transaccion || null,
      })

      const response = await fetch(`/api/financiero/registrar-pago/${pago.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metodo_pago: formData.metodo_pago,
          fecha_pago: formData.fecha_pago,
          id_transaccion: formData.id_transaccion || null,
        })
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Response no es JSON:', contentType)
        const textResponse = await response.text()
        console.error('❌ Response text:', textResponse)
        throw new Error(`La API retornó un formato inválido: ${textResponse.substring(0, 100)}`)
      }
      
      const data = await response.json()
      console.log('📥 Response data:', data)

      if (!response.ok) {
        console.log('❌ Response no OK, lanzando error')
        throw new Error(data.error || 'Error al registrar el pago')
      }

      console.log('✅ Pago registrado exitosamente')
      toast({
        title: "✅ Pago registrado exitosamente",
        description: `El pago de ${pago.residente.nombre} ${pago.residente.apellido} ha sido marcado como pagado`,
      })

      // Reset y cerrar
      setFormData({
        metodo_pago: "",
        id_transaccion: "",
        fecha_pago: new Date().toISOString().split('T')[0]
      })
      
      onPagoRegistrado()
      onClose()

    } catch (error) {
      console.error("❌ Error registrando pago:", error)
      toast({
        title: "Error al registrar pago",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Registrar Pago Recibido
          </DialogTitle>
          <DialogDescription>
            Completa la información del pago realizado por el residente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* Información del Pago */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Detalles del Pago</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Residente:</span>
                <span className="font-medium">{pago.residente.nombre} {pago.residente.apellido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departamento:</span>
                <span className="font-medium">{pago.departamento.numero} - Piso {pago.departamento.piso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{pago.tipo_pago}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto base:</span>
                <span className="font-medium">${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {pago.recargo > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recargo:</span>
                  <span className="font-medium text-orange-600">+${pago.recargo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span className="font-semibold text-blue-900">Total a pagar:</span>
                <span className="font-bold text-lg text-blue-700">
                  ${totalAPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-2">
            <Label htmlFor="metodo_pago" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              Método de Pago <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.metodo_pago || undefined}
              onValueChange={(value) => {
                console.log('🔵 Método de pago seleccionado:', value)
                setFormData(prev => ({ ...prev, metodo_pago: value }))
              }}
            >
              <SelectTrigger id="metodo_pago">
                <SelectValue placeholder="Selecciona el método" />
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
                    Tarjeta de Crédito/Débito
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

          {/* Fecha de Pago */}
          <div className="space-y-2">
            <Label htmlFor="fecha_pago" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Fecha en que se realizó el pago <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha_pago"
              type="date"
              value={formData.fecha_pago}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_pago: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* ID de Transacción */}
          <div className="space-y-2">
            <Label htmlFor="id_transaccion" className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-green-600" />
              ID de Transacción (opcional)
            </Label>
            <Input
              id="id_transaccion"
              type="text"
              placeholder="Ej: TXN123456789"
              value={formData.id_transaccion}
              onChange={(e) => setFormData(prev => ({ ...prev, id_transaccion: e.target.value }))}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Número de referencia, folio o comprobante del pago
            </p>
          </div>

        </div>

        <DialogFooter>
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={handleRegistrar}
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar Pago
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
