import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, X, Wifi, Car, Wind, Shield, Waves, Dumbbell, Droplets, Zap, Flame, FileText, Download } from "lucide-react"
import { Departamento } from "@/types/departamentos"
import { generarPDF } from "@/lib/pdf-utils"

interface DepartamentoDetalleModalProps {
  departamento: Departamento | null
  open: boolean
  onClose: () => void
}

export default function DepartamentoDetalleModal({ 
  departamento, 
  open, 
  onClose 
}: DepartamentoDetalleModalProps) {
  if (!departamento) return null

  // Formatear moneda
  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(cantidad)
  }

  // Obtener color del estado
  const obtenerColorEstado = (estado: string) => {
    const colores = {
      disponible: "bg-green-100 text-green-800 border-green-200",
      ocupado: "bg-red-100 text-red-800 border-red-200", 
      mantenimiento: "bg-yellow-100 text-yellow-800 border-yellow-200",
      no_disponible: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colores[estado as keyof typeof colores] || "bg-gray-100 text-gray-800"
  }

  // Iconos para servicios
  const iconosServicios = {
    agua: Droplets,
    electricidad: Zap,
    gas: Flame,
    wifi: Wifi,
    internet: Wifi,
    cable: Wifi,
    parqueadero: Car,
    balcon: CheckCircle,
    aire_acondicionado: Wind,
    lavanderia: CheckCircle,
    gimnasio: Dumbbell,
    piscina: Waves,
    seguridad: Shield
  }

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-[1200px] max-w-none max-h-[90vh] overflow-y-auto"
        style={{ width: '1200px', maxWidth: 'none' }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Departamento {departamento.numero}
              </DialogTitle>
              <DialogDescription>
                Información completa del departamento
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  try {
                    await generarPDF.departamento(departamento)
                  } catch (error) {
                    console.error('Error generando PDF:', error)
                  }
                }}
                variant="outline"
                className="flex items-center gap-2 bg-[#007BFF] text-white hover:bg-[#0056b3] border-[#007BFF]"
              >
                <FileText className="h-4 w-4" />
                Generar PDF
              </Button>
              <Badge className={obtenerColorEstado(departamento.estado)}>
                {departamento.estado.toUpperCase()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Número:</span>
                <span className="font-semibold">{departamento.numero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Piso:</span>
                <span>{departamento.piso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dormitorios:</span>
                <span>{departamento.dormitorios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Baños:</span>
                <span>{departamento.banos}</span>
              </div>
              {departamento.area_m2 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área:</span>
                  <span>{departamento.area_m2} m²</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="outline" className={obtenerColorEstado(departamento.estado)}>
                  {departamento.estado}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Financiera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Renta Mensual:</span>
                <span className="font-semibold text-lg text-green-600">
                  {formatearMoneda(departamento.renta_mensual)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mantenimiento:</span>
                <span className="font-medium">
                  {formatearMoneda(departamento.mantenimiento_mensual)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Total Mensual:</span>
                <span className="font-bold text-lg">
                  {formatearMoneda(departamento.renta_mensual + departamento.mantenimiento_mensual)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Servicios */}
          {departamento.servicios && Object.keys(departamento.servicios).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Servicios Incluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(departamento.servicios).map(([servicio, incluido]) => {
                    const IconoServicio = iconosServicios[servicio as keyof typeof iconosServicios] || CheckCircle
                    
                    return (
                      <div key={servicio} className="flex items-center gap-2">
                        {incluido ? (
                          <>
                            <IconoServicio className="h-4 w-4 text-green-600" />
                            <span className="text-sm capitalize">
                              {servicio.replace('_', ' ')}
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-muted-foreground capitalize">
                              {servicio.replace('_', ' ')}
                            </span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descripción */}
          {departamento.descripcion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{departamento.descripcion}</p>
              </CardContent>
            </Card>
          )}

          {/* Imágenes */}
          {departamento.imagenes && departamento.imagenes.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Galería de Imágenes</CardTitle>
                <CardDescription>
                  {departamento.imagenes.length} imagen(es) disponible(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {departamento.imagenes.map((imagen: any, index: number) => (
                    <div 
                      key={index}
                      className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-border"
                    >
                      <div className="text-center p-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          Imagen {index + 1}
                        </div>
                        <div className="text-xs font-mono bg-muted-foreground/10 p-1 rounded">
                          {typeof imagen === 'string' ? imagen : JSON.stringify(imagen)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-muted-foreground text-sm">ID del Departamento:</span>
                  <div className="font-mono text-sm">{departamento.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Estado Activo:</span>
                  <div className="flex items-center gap-1">
                    {departamento.activo ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Activo</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Inactivo</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Fecha de Creación:</span>
                  <div className="text-sm">{formatearFecha(departamento.creado_en)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}