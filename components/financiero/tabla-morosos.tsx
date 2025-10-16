"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  AlertTriangle, 
  Download, 
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generarPDFMorosos } from "@/lib/pdf/pdf-morosos"

interface Moroso {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
  departamento_numero: string
  departamento_piso: number
  monto: number
  recargo: number
  total_adeudado: number
  dias_atraso: number
  tipo_pago: string
  descripcion: string
  fecha_vencimiento: string
}

interface Estadisticas {
  total_morosos: number
  total_adeudado: number
  total_recargos: number
  promedio_dias_atraso: number
}

export default function TablaMorosos() {
  const [morosos, setMorosos] = useState<Moroso[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [enviandoEmail, setEnviandoEmail] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMorosos()
  }, [])

  const fetchMorosos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/financiero/morosos')
      const data = await response.json()
      
      if (response.ok) {
        setMorosos(data.morosos)
        setEstadisticas(data.estadisticas)
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudieron cargar los morosos",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching morosos:', error)
      toast({
        title: "Error",
        description: "Error al cargar la información de morosos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerarPDF = async () => {
    try {
      setGenerandoPDF(true)
      await generarPDFMorosos(morosos, estadisticas!)
      
      toast({
        title: "✅ PDF generado",
        description: "El reporte de morosos se ha descargado correctamente",
      })
    } catch (error) {
      console.error('Error generando PDF:', error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      })
    } finally {
      setGenerandoPDF(false)
    }
  }

  const handleEnviarEmail = async (moroso: Moroso) => {
    try {
      setEnviandoEmail(moroso.id)
      
      const response = await fetch('/api/financiero/enviar-recordatorio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: moroso.nombre,
          apellido: moroso.apellido,
          correo: moroso.correo,
          departamento: moroso.departamento_numero,
          tipo_pago: moroso.tipo_pago,
          monto: moroso.monto,
          recargo: moroso.recargo,
          total_adeudado: moroso.total_adeudado,
          dias_atraso: moroso.dias_atraso,
          fecha_vencimiento: moroso.fecha_vencimiento,
          descripcion: moroso.descripcion
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Email enviado",
          description: `Se ha enviado el recordatorio de pago a ${moroso.nombre} ${moroso.apellido}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo enviar el email",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error enviando email:', error)
      toast({
        title: "Error",
        description: "Error al enviar el recordatorio",
        variant: "destructive"
      })
    } finally {
      setEnviandoEmail(null)
    }
  }

  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-MX', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSeveridadAtraso = (dias: number) => {
    if (dias >= 60) return { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700', label: 'Crítico' }
    if (dias >= 30) return { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700', label: 'Grave' }
    if (dias >= 15) return { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700', label: 'Moderado' }
    return { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700', label: 'Leve' }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Morosos</CardTitle>
              <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {estadisticas.total_morosos}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Adeudado</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${formatearMonto(estadisticas.total_adeudado)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Días Atraso</CardTitle>
              <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {estadisticas.promedio_dias_atraso} días
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de Morosos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Deudores Morosos
              </CardTitle>
            </div>
            <Button 
              onClick={handleGenerarPDF}
              disabled={generandoPDF || morosos.length === 0}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {generandoPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Reporte PDF
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {morosos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                🎉 No hay morosos registrados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Residente</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Recargo</TableHead>
                    <TableHead>Total Adeudado</TableHead>
                    <TableHead>Días Atraso</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Contacto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {morosos.map((moroso) => {
                    const severidad = getSeveridadAtraso(moroso.dias_atraso)
                    return (
                      <TableRow key={moroso.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {moroso.nombre} {moroso.apellido}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Vencido: {formatearFecha(moroso.fecha_vencimiento)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            #{moroso.departamento_numero}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge variant="secondary" className="mb-1">
                              {moroso.tipo_pago}
                            </Badge>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {moroso.descripcion}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${formatearMonto(moroso.monto)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            +${formatearMonto(moroso.recargo || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            ${formatearMonto(moroso.total_adeudado)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg">
                            {moroso.dias_atraso}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={severidad.color}>
                            {severidad.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEnviarEmail(moroso)}
                            disabled={enviandoEmail === moroso.id}
                            title="Enviar recordatorio de pago"
                            className="hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            {enviandoEmail === moroso.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
