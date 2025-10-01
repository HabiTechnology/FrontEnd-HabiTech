"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Pago {
  id: number
  monto: number
  tipo_pago: string
  estado: string
  fecha_pago: string
  metodo_pago: string
  residente: string
  numero_departamento: string
}

export function PagosRecientesTable() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>💳 Pagos Recientes</CardTitle>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                      ${pago.monto.toLocaleString('es-MX')}
                    </TableCell>
                    <TableCell className="capitalize">{pago.metodo_pago}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadge(pago.estado)}>
                        {pago.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(pago.fecha_pago).toLocaleDateString('es-MX')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
