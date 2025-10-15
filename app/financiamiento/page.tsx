"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, Users } from "lucide-react"
import CrearPagoMejorado from "@/components/financiero/crear-pago-mejorado"
import TablaPagosMejorada from "@/components/financiero/tabla-pagos-mejorada"

export default function FinanciamientoPage() {
  const [stats, setStats] = useState({
    totalIngresos: 0,
    pagosPendientes: 0,
    pagosMes: 0,
    residentesActivos: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/financiero')
      const data = await response.json()
      
      // Mapear la estructura del API a nuestro estado
      setStats({
        totalIngresos: data.ingresos?.total_mes || 0,
        pagosPendientes: data.ingresos?.pagos_pendientes || 0,
        pagosMes: data.ingresos?.pagos_completados || 0,
        residentesActivos: data.ingresos?.departamentos_ocupados || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión Financiera</h1>
          <p className="text-muted-foreground">
            Administra pagos, genera comprobantes y monitorea el estado financiero
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${stats.totalIngresos.toLocaleString('es-MX')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pagosPendientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pagosMes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residentes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.residentesActivos}
            </div>
          </CardContent>
        </Card>
      </div>

      <CrearPagoMejorado onPagoCreado={fetchStats} />
      <TablaPagosMejorada />
    </div>
  )
}