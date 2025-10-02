"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Download, Eye, Loader2 } from "lucide-react"
import { previewFacturaPDF, descargarFacturaPDF, type PagoParaFactura } from "@/lib/pdf/pdf-factura"
import { useToast } from "@/hooks/use-toast"

interface FacturaModalProps {
  pago: {
    id: number
    monto: number
    tipo_pago: string
    estado: string
    fecha_vencimiento: string
    fecha_pago?: string | null
    metodo_pago?: string | null
    referencia?: string | null
    residente_id?: number
    departamento_id?: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FacturaModal({ pago, open, onOpenChange }: FacturaModalProps) {
  const [loading, setLoading] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [pagoCompleto, setPagoCompleto] = useState<PagoParaFactura | null>(null)
  const { toast } = useToast()

  // Debug: Monitorear cambios en pagoCompleto
  useEffect(() => {
    console.log("🔍 pagoCompleto cambió:", pagoCompleto ? "✅ TIENE DATOS" : "❌ NULL")
    if (pagoCompleto) {
      console.log("   📋 Datos completos:", {
        residente: pagoCompleto.residente?.usuario?.nombre + " " + pagoCompleto.residente?.usuario?.apellido,
        departamento: pagoCompleto.departamento?.numero
      })
    }
  }, [pagoCompleto])

  const cargarDatosCompletos = async () => {
    setLoading(true)
    try {
      console.log("🔄 Cargando datos completos para pago ID:", pago.id)
      const response = await fetch(`/api/pagos/${pago.id}/factura`)
      
      console.log("📡 Response status:", response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("📦 Datos recibidos del servidor:", data)
      
      if (data.success && data.pago) {
        console.log("✅ Pago completo cargado:", data.pago)
        console.log("   👤 Residente:", data.pago.residente?.usuario?.nombre, data.pago.residente?.usuario?.apellido)
        console.log("   🏢 Departamento:", data.pago.departamento?.numero)
        console.log("🎯 Llamando setPagoCompleto con:", data.pago)
        
        // Usar callback form para asegurar que el estado se actualiza
        setPagoCompleto(prev => {
          console.log("🎯 setPagoCompleto CALLBACK - prev:", prev ? "tenía datos" : "era null")
          console.log("🎯 setPagoCompleto CALLBACK - new:", data.pago ? "tiene datos" : "es null")
          return data.pago
        })
        
        console.log("🎯 setPagoCompleto ejecutado")
      } else {
        console.warn("⚠️ Respuesta sin datos de pago:", data)
      }
    } catch (error) {
      console.error("❌ Error al cargar datos completos:", error)
      toast({
        title: "Error al cargar datos",
        description: "Se usarán datos básicos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos cuando el modal se abre
  useEffect(() => {
    console.log("🎬 useEffect - open cambió a:", open)
    if (open) {
      console.log("🎬 Modal abierto - iniciando carga de datos")
      setPagoCompleto(null)
      cargarDatosCompletos()
    } else {
      console.log("🎬 Modal cerrado - limpiando estado")
      setPagoCompleto(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handlePreview = async () => {
    setGeneratingPDF(true)
    const datos: PagoParaFactura = pagoCompleto || {
      ...pago,
      residente_id: pago.residente_id || 0,
      departamento_id: pago.departamento_id || 0,
      residente: {
        usuario: {
          nombre: `Residente`,
          apellido: `ID: ${pago.residente_id || "N/A"}`,
          correo: "sin-datos@email.com",
          telefono: "Sin datos"
        }
      },
      departamento: {
        numero: `${pago.departamento_id || "N/A"}`,
        piso: 0
      }
    }
    try {
      console.log("📄 Generando preview con datos:", datos)
      await previewFacturaPDF(datos)
      toast({ 
        title: "✅ Vista previa generada",
        description: "La factura se abrió en una nueva pestaña" 
      })
    } catch (error) {
      console.error("Error al generar preview:", error)
      toast({ 
        title: "❌ Error", 
        description: error instanceof Error ? error.message : "No se pudo generar la vista previa",
        variant: "destructive" 
      })
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleDescargar = async () => {
    setGeneratingPDF(true)
    const datos: PagoParaFactura = pagoCompleto || {
      ...pago,
      residente_id: pago.residente_id || 0,
      departamento_id: pago.departamento_id || 0,
      residente: {
        usuario: {
          nombre: `Residente`,
          apellido: `ID: ${pago.residente_id || "N/A"}`,
          correo: "sin-datos@email.com",
          telefono: "Sin datos"
        }
      },
      departamento: {
        numero: `${pago.departamento_id || "N/A"}`,
        piso: 0
      }
    }
    try {
      console.log("💾 Descargando factura con datos:", datos)
      await descargarFacturaPDF(datos)
      toast({ 
        title: "✅ Factura descargada",
        description: "El archivo PDF se guardó en tu equipo"
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al descargar factura:", error)
      toast({ 
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo descargar la factura",
        variant: "destructive" 
      })
    } finally {
      setGeneratingPDF(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-500/10">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Generar Factura</DialogTitle>
              <DialogDescription>
                Factura #{String(pago.id).padStart(8, "0")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {(() => {
              console.log("🎨 Renderizando contenido - pagoCompleto:", !!pagoCompleto, pagoCompleto)
              console.log("🎨 Residente:", pagoCompleto?.residente?.usuario?.nombre)
              console.log("🎨 Departamento:", pagoCompleto?.departamento?.numero)
              return null
            })()}
            {pagoCompleto ? (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-3">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  ✅ Datos completos cargados
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Residente: {pagoCompleto.residente?.usuario?.nombre} {pagoCompleto.residente?.usuario?.apellido} | 
                  Departamento: {pagoCompleto.departamento?.numero}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 p-3">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  ⚠️ Usando datos básicos del pago
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  No se pudieron cargar los datos completos del residente y departamento.
                </p>
              </div>
            )}
            
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concepto</p>
                  <p className="text-base font-semibold capitalize">
                    {pago.tipo_pago.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Monto</p>
                  <p className="text-lg font-bold text-green-600">
                    ${Number(pago.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className={`font-medium capitalize ${
                      pago.estado === "pagado"
                        ? "text-green-600"
                        : pago.estado === "pendiente"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                      {pago.estado}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimiento</p>
                    <p className="font-medium">
                      {new Date(pago.fecha_vencimiento).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  {pago.metodo_pago && (
                    <div>
                      <p className="text-muted-foreground">Método de Pago</p>
                      <p className="font-medium capitalize">
                        {pago.metodo_pago.replace("_", " ")}
                      </p>
                    </div>
                  )}
                  {pago.fecha_pago && (
                    <div>
                      <p className="text-muted-foreground">Fecha de Pago</p>
                      <p className="font-medium">
                        {new Date(pago.fecha_pago).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>ℹ️ Nota:</strong> La factura se generará con los datos disponibles.
                {!pagoCompleto && " Para información completa, verifica la conexión a la base de datos."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || generatingPDF}
            className="w-full sm:w-auto"
          >
            CANCELAR
          </Button>
          <Button
            variant="secondary"
            onClick={handlePreview}
            disabled={loading || generatingPDF}
            className="gap-2 w-full sm:w-auto"
          >
            {generatingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                VISTA PREVIA
              </>
            )}
          </Button>
          <Button
            onClick={handleDescargar}
            disabled={loading || generatingPDF}
            className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            {generatingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                DESCARGAR PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
