"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Eye,
  CheckCircle, 
  Building2,
  Calendar,
  CreditCard,
  Hash,
  DollarSign,
  Loader2
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { descargarFacturaPDF, previewFacturaPDF } from "@/lib/pdf/pdf-factura"
import { useToast } from "@/hooks/use-toast"

interface Pago {
  id: number
  tipo_pago: string
  monto: number
  fecha_vencimiento: string
  fecha_pago: string | null
  metodo_pago: string | null
  id_transaccion: string | null
  estado: string
  descripcion: string
  recargo: number
  creado_en: string
  residente: {
    nombre: string
    apellido: string
  }
  departamento: {
    numero: string
    piso: number
  }
}

interface FacturaModalProps {
  pago: Pago | null
  isOpen: boolean
  onClose: () => void
}

export default function FacturaModal({ pago, isOpen, onClose }: FacturaModalProps) {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  if (!pago) return null

  // Asegurar que los montos sean números
  const montoBase = Number(pago.monto) || 0
  const recargo = Number(pago.recargo) || 0
  const totalPagado = montoBase + recargo

  // Función para formatear montos correctamente
  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-MX', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Convertir el formato de pago al formato esperado por pdf-factura.ts
  const convertirPagoParaPDF = () => {
    return {
      id: pago.id,
      residente_id: 0, // No necesario para el PDF
      departamento_id: 0, // No necesario para el PDF
      monto: montoBase,
      tipo_pago: pago.tipo_pago,
      estado: pago.estado,
      fecha_vencimiento: pago.fecha_vencimiento,
      fecha_pago: pago.fecha_pago,
      metodo_pago: pago.metodo_pago,
      referencia: pago.id_transaccion,
      notas: pago.descripcion,
      recargo: recargo,
      residente: {
        usuario: {
          nombre: pago.residente.nombre,
          apellido: pago.residente.apellido,
          correo: undefined,
          numero_documento: undefined,
          telefono: undefined
        }
      },
      departamento: {
        numero: pago.departamento.numero,
        piso: pago.departamento.piso
      }
    }
  }

  const handleDescargar = async () => {
    try {
      setDownloading(true)
      console.log('📥 Generando PDF para descarga...')
      
      const pagoParaPDF = convertirPagoParaPDF()
      await descargarFacturaPDF(pagoParaPDF)
      
      toast({
        title: "✅ PDF descargado",
        description: "La factura se ha descargado correctamente",
      })
    } catch (error) {
      console.error('❌ Error al descargar PDF:', error)
      toast({
        title: "Error al descargar",
        description: "Ocurrió un error al generar el PDF",
        variant: "destructive"
      })
    } finally {
      setDownloading(false)
    }
  }

  const handlePreview = async () => {
    try {
      setPreviewing(true)
      console.log('👁️ Abriendo preview del PDF...')
      
      const pagoParaPDF = convertirPagoParaPDF()
      await previewFacturaPDF(pagoParaPDF)
      
    } catch (error) {
      console.error('❌ Error al previsualizar PDF:', error)
      toast({
        title: "Error al previsualizar",
        description: "Ocurrió un error al generar el preview",
        variant: "destructive"
      })
    } finally {
      setPreviewing(false)
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getMetodoPagoText = (metodo: string | null) => {
    if (!metodo) return 'No especificado'
    switch (metodo) {
      case 'efectivo': return 'Efectivo'
      case 'transferencia': return 'Transferencia Bancaria'
      case 'tarjeta': return 'Tarjeta de Crédito/Débito'
      case 'online': return 'Pago en Línea'
      default: return metodo
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            Comprobante de Pago
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Recibo #{pago.id.toString().padStart(6, '0')}
          </DialogDescription>
        </DialogHeader>

        {/* Contenido de la Factura */}
        <div className="space-y-6 py-4" id="factura-content">
          
          {/* Header de la Factura */}
          <div className="flex justify-between items-start p-6 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6" />
                <h2 className="text-2xl font-bold">HabiTech</h2>
              </div>
              <p className="text-sm text-blue-100 dark:text-blue-50">Sistema de Gestión Residencial</p>
              <p className="text-xs text-blue-200 dark:text-blue-100 mt-1">RFC: HTC123456789</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                <p className="text-xs text-blue-100 dark:text-blue-50">Folio</p>
                <p className="text-xl font-bold">#{pago.id.toString().padStart(6, '0')}</p>
              </div>
              <p className="text-xs text-blue-200 dark:text-blue-100 mt-2">
                Fecha de emisión: {new Date().toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>

          {/* Información del Residente */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Datos del Cliente</h3>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre completo</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{pago.residente.nombre} {pago.residente.apellido}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Departamento</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">#{pago.departamento.numero} - Piso {pago.departamento.piso}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Detalles del Pago</h3>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tipo de pago</p>
                <Badge variant="outline" className="mt-1 dark:border-gray-600 dark:text-gray-200">{pago.tipo_pago}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                <Badge className="mt-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pagado
                </Badge>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200 mb-2">Concepto</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{pago.descripcion}</p>
          </div>

          {/* Detalles de fechas y método */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de vencimiento</p>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{formatFecha(pago.fecha_vencimiento)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de pago</p>
                <p className="font-medium text-sm text-green-700 dark:text-green-300">
                  {pago.fecha_pago ? formatFecha(pago.fecha_pago) : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Método de pago</p>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{getMetodoPagoText(pago.metodo_pago)}</p>
              </div>
            </div>
          </div>

          {/* ID de Transacción */}
          {pago.id_transaccion && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
              <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID de Transacción</p>
                <p className="font-mono text-sm font-medium text-purple-700 dark:text-purple-300">{pago.id_transaccion}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Desglose de Montos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Desglose de Pago</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Monto base</span>
                <span className="font-medium text-lg text-gray-900 dark:text-gray-100">
                  ${formatearMonto(montoBase)}
                </span>
              </div>

              {recargo > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-orange-600 dark:text-orange-400">Recargo por mora</span>
                  <span className="font-medium text-lg text-orange-600 dark:text-orange-400">
                    +${formatearMonto(recargo)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 rounded-lg">
                <span className="font-bold text-green-900 dark:text-green-200 text-lg">Total Pagado</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-700 dark:text-green-400" />
                  <span className="font-bold text-2xl text-green-700 dark:text-green-300">
                    ${formatearMonto(totalPagado)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t dark:border-gray-700 text-center space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Este comprobante fue generado electrónicamente por HabiTech
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Fecha de generación: {new Date().toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handlePreview}
            disabled={previewing}
          >
            {previewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Abriendo...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Ver PDF
              </>
            )}
          </Button>
          <Button
            type="button"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleDescargar}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
