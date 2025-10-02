"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { FacturaModal } from "./factura-modal"

interface Pago {
  id: number
  monto: number
  tipo_pago: string
  estado: string
  fecha_pago: string
  fecha_vencimiento: string
  metodo_pago: string
  referencia?: string | null
  residente: string
  numero_departamento: string
}

export function PagosRecientesTable() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null)
  const [facturaModalOpen, setFacturaModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/pagos-recientes")
        const result = await response.json()
        setPagos(result.data || [])
      } catch (error) {
        console.error("Error fetching pagos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // 1 min
    return () => clearInterval(interval)
  }, [])

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pagado: "default",
      pendiente: "secondary",
      vencido: "destructive"
    }
    return variants[estado] || "outline"
  }

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      renta: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      mantenimiento: "bg-green-500/10 text-green-500 border-green-500/20",
      multa: "bg-red-500/10 text-red-500 border-red-500/20",
      deposito: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
    return colors[tipo] || ""
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  // Calcular el total de todos los pagos
  const totalPagos = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>💳 Pagos Recientes</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Últimas 10 transacciones</p>
        </div>
        {pagos.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Mostrado</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalPagos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Residente</TableHead>
                <TableHead>Depto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-center">Factura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No hay pagos recientes
                  </TableCell>
                </TableRow>
              ) : (
                pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell className="font-medium">{pago.residente}</TableCell>
                    <TableCell>{pago.numero_departamento}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTipoBadge(pago.tipo_pago)}>
                        {pago.tipo_pago}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(pago.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="capitalize">
                      {pago.metodo_pago || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadge(pago.estado)}>
                        {pago.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pago.fecha_pago 
                        ? new Date(pago.fecha_pago).toLocaleDateString('es-MX')
                        : new Date(pago.fecha_vencimiento).toLocaleDateString('es-MX')
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPago(pago)
                          setFacturaModalOpen(true)
                        }}
                        className="gap-2 hover:bg-blue-50 hover:text-blue-600"
                        title="Generar factura"
                      >
                        <FileText className="h-4 w-4" />
                        Factura
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal de factura */}
      {selectedPago && (
        <FacturaModal
          pago={selectedPago}
          open={facturaModalOpen}
          onOpenChange={setFacturaModalOpen}
        />
      )}
    </Card>
  )
}
