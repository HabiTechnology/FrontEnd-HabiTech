"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  DollarSign,
  Calendar,
  CreditCard,
  AlertCircle,
  Download,
  Eye
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import FacturaModal from "@/components/financiero/factura-modal"
import ModalPagoStripe from "@/components/financiero/modal-pago-stripe"

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
  url_recibo: string | null
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

export default function TablaPagosMejorada() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal de factura
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null)
  const [modalFactura, setModalFactura] = useState(false)
  
  // Modal de pago Stripe
  const [modalPagoStripe, setModalPagoStripe] = useState(false)

  useEffect(() => {
    fetchPagos()
  }, [])

  const fetchPagos = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch('/api/financiero/pagos')
      const data = await response.json()
      
      setPagos(data)
    } catch (error) {
      console.error('Error fetching pagos:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchPagos(true)
  }

  const handleVerFactura = (pago: Pago) => {
    setPagoSeleccionado(pago)
    setModalFactura(true)
  }

  const handlePagarConStripe = (pago: Pago) => {
    setPagoSeleccionado(pago)
    setModalPagoStripe(true)
  }

  const handleSuccessStripe = () => {
    // Refrescar la lista de pagos después de un pago exitoso
    fetchPagos(true)
  }

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pagado
        </Badge>
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      case 'atrasado':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Atrasado
        </Badge>
      case 'cancelado':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">
          Cancelado
        </Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getBadgeTipo = (tipo: string) => {
    switch (tipo) {
      case 'renta':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Renta</Badge>
      case 'mantenimiento':
        return <Badge variant="outline" className="border-green-300 text-green-700">Mantenimiento</Badge>
      case 'multa':
        return <Badge variant="outline" className="border-red-300 text-red-700">Multa</Badge>
      case 'deposito':
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Depósito</Badge>
      default:
        return <Badge variant="outline">{tipo}</Badge>
    }
  }

  const getMetodoPagoIcon = (metodo: string | null) => {
    if (!metodo) return null
    
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <CreditCard className="h-3 w-3" />
        {metodo === 'efectivo' && 'Efectivo'}
        {metodo === 'transferencia' && 'Transferencia'}
        {metodo === 'tarjeta' && 'Tarjeta'}
        {metodo === 'online' && 'Online'}
      </div>
    )
  }

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '-'
    try {
      // Las fechas vienen de PostgreSQL en formato YYYY-MM-DD o ISO
      // Aseguramos que se interpreten en hora local
      const date = new Date(fecha.includes('T') ? fecha : fecha + 'T00:00:00')
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) return '-'
      
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error al formatear fecha:', fecha, error)
      return '-'
    }
  }

  const esPagoAtrasado = (pago: Pago) => {
    if (pago.estado === 'pagado' || pago.estado === 'cancelado') return false
    const hoy = new Date()
    const vencimiento = new Date(pago.fecha_vencimiento + 'T00:00:00')
    return hoy > vencimiento
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestión de Pagos
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="min-w-[180px]">Residente</TableHead>
                    <TableHead className="min-w-[100px]">Tipo</TableHead>
                    <TableHead className="min-w-[120px] text-right">Monto</TableHead>
                    <TableHead className="min-w-[110px]">Vencimiento</TableHead>
                    <TableHead className="min-w-[110px]">Fecha Pago</TableHead>
                    <TableHead className="min-w-[120px]">Estado</TableHead>
                    <TableHead className="min-w-[110px]">Método</TableHead>
                    <TableHead className="min-w-[220px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No hay pagos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagos.map((pago) => (
                      <TableRow 
                        key={pago.id}
                        className={esPagoAtrasado(pago) ? 'bg-red-50/30' : ''}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {pago.residente.nombre} {pago.residente.apellido}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Depto {pago.departamento.numero}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getBadgeTipo(pago.tipo_pago)}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-blue-700">
                              ${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            {pago.recargo > 0 && (
                              <span className="text-xs text-orange-600">
                                +${pago.recargo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatFecha(pago.fecha_vencimiento)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {pago.fecha_pago ? (
                            <div className="flex items-center gap-1 text-sm text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              {formatFecha(pago.fecha_pago)}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {getBadgeEstado(pago.estado)}
                        </TableCell>
                        
                        <TableCell>
                          {getMetodoPagoIcon(pago.metodo_pago)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-2 justify-end items-center">
                            {/* Botón de Pagar con Stripe (solo para pagos pendientes/atrasados) */}
                            {(pago.estado === 'pendiente' || pago.estado === 'atrasado') && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                                onClick={() => handlePagarConStripe(pago)}
                              >
                                <CreditCard className="h-3 w-3 mr-1.5" />
                                Pagar
                              </Button>
                            )}
                            
                            {/* Botón de Ver Factura */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs whitespace-nowrap"
                              onClick={() => handleVerFactura(pago)}
                            >
                              <Eye className="h-3 w-3 mr-1.5" />
                              Ver Factura
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Factura */}
      <FacturaModal
        pago={pagoSeleccionado}
        isOpen={modalFactura}
        onClose={() => {
          setModalFactura(false)
          setPagoSeleccionado(null)
        }}
      />

      {/* Modal de Pago con Stripe */}
      {pagoSeleccionado && (
        <ModalPagoStripe
          open={modalPagoStripe}
          onClose={() => {
            setModalPagoStripe(false)
            setPagoSeleccionado(null)
          }}
          pagoData={{
            id: pagoSeleccionado.id,
            monto: Number(pagoSeleccionado.monto) + Number(pagoSeleccionado.recargo || 0),
            descripcion: `${pagoSeleccionado.tipo_pago.toUpperCase()} - Depto ${pagoSeleccionado.departamento.numero}`,
            residenteId: pagoSeleccionado.id,
            departamentoId: pagoSeleccionado.id,
            correo: `${pagoSeleccionado.residente.nombre}@habitech.com`,
            nombre: `${pagoSeleccionado.residente.nombre} ${pagoSeleccionado.residente.apellido}`,
          }}
          onSuccess={handleSuccessStripe}
        />
      )}
    </>
  )
}
