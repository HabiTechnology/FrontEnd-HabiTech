"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import { RoleGuard } from "@/components/role-guard"
import { DollarSign, TrendingUp, TrendingDown, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PagosRecientesTable = dynamic(() => import("@/components/dashboard/pagos-recientes-table").then(mod => ({ default: mod.PagosRecientesTable })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
})

interface FinancieroStats {
  ingresos: {
    total_mes: number
    pendientes: number
    confirmados: number
    total_pagos: number
    pagos_completados: number
    pagos_pendientes: number
    pagos_atrasados: number
    tendencia: 'up' | 'down'
    porcentaje_cambio: number
  }
  gastos: {
    salarios_personal: number
    personal_activo: number
  }
  balance: {
    neto: number
    ingresos: number
    gastos: number
  }
  por_tipo: Array<{
    tipo: string
    total: number
    cantidad: number
  }>
  historial: Array<{
    fecha: string
    ingresos: number
  }>
}

export default function DashboardFinanciero() {
  const [stats, setStats] = useState<FinancieroStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/financiero")
        const data = await response.json()
        
        console.log("💰 Dashboard Financiero Response:", data)
        
        if (data.error) {
          console.error("❌ Error from API:", data.error)
          setStats(null)
        } else {
          setStats(data)
        }
        
        const now = new Date()
        setLastUpdate(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
      } catch (error) {
        console.error("❌ Error fetching financial stats:", error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Actualizar cada minuto
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardPageLayout
        header={{
          title: "Dashboard Financiero - Gestión de Ingresos y Gastos",
          description: `Última actualización ${lastUpdate || "cargando..."}`,
          icon: Wallet,
        }}
      >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loading ? (
          <>
            <div className="animate-pulse bg-muted h-32 rounded" />
            <div className="animate-pulse bg-muted h-32 rounded" />
            <div className="animate-pulse bg-muted h-32 rounded" />
            <div className="animate-pulse bg-muted h-32 rounded" />
          </>
        ) : stats ? (
          <>
            <DashboardStat
              label="INGRESOS DEL MES"
              value={`$${stats.ingresos.total_mes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              description="PAGOS CONFIRMADOS ESTE MES"
              icon={DollarSign}
              tag={`${stats.ingresos.porcentaje_cambio}%`}
              intent={stats.ingresos.tendencia === "up" ? "positive" : "negative"}
              direction={stats.ingresos.tendencia}
            />
            <DashboardStat
              label="PAGOS PENDIENTES"
              value={`$${stats.ingresos.pendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              description={`${stats.ingresos.pagos_pendientes} PAGOS POR CONFIRMAR`}
              icon={TrendingDown}
              tag={`${stats.ingresos.pagos_atrasados} ATRASADOS`}
              intent={stats.ingresos.pagos_atrasados > 0 ? "negative" : "neutral"}
            />
            <DashboardStat
              label="GASTOS OPERATIVOS"
              value={`$${stats.gastos.salarios_personal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              description={`SALARIOS ${stats.gastos.personal_activo} EMPLEADOS`}
              icon={Users}
              tag="MENSUAL"
              intent="neutral"
            />
            <DashboardStat
              label="BALANCE NETO"
              value={`$${stats.balance.neto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              description="INGRESOS - GASTOS"
              icon={stats.balance.neto >= 0 ? TrendingUp : TrendingDown}
              tag={stats.balance.neto >= 0 ? "POSITIVO" : "NEGATIVO"}
              intent={stats.balance.neto >= 0 ? "positive" : "negative"}
              direction={stats.balance.neto >= 0 ? "up" : "down"}
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            Error al cargar estadísticas financieras
          </div>
        )}
      </div>

      {/* Desglose por Tipo de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Tipo</CardTitle>
            <CardDescription>Distribución de pagos del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            ) : stats && stats.por_tipo.length > 0 ? (
              <div className="space-y-4">
                {stats.por_tipo.map((tipo) => (
                  <div key={tipo.tipo} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{tipo.tipo.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{tipo.cantidad} pagos</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      ${tipo.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pagos</CardTitle>
            <CardDescription>Estado de los pagos del mes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Pagos Completados</p>
                    <p className="text-sm text-muted-foreground">{stats.ingresos.pagos_completados} transacciones</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ${stats.ingresos.confirmados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Pagos Pendientes</p>
                    <p className="text-sm text-muted-foreground">{stats.ingresos.pagos_pendientes} transacciones</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-600">
                    ${stats.ingresos.pendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {stats.ingresos.pagos_atrasados > 0 && (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">Pagos Atrasados</p>
                      <p className="text-sm text-muted-foreground">{stats.ingresos.pagos_atrasados} transacciones</p>
                    </div>
                    <p className="text-lg font-bold text-red-600">¡URGENTE!</p>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Historial de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos</CardTitle>
          <CardDescription>Últimos 30 días de actividad financiera</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse h-48 bg-muted rounded" />
          ) : stats && stats.historial.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-4">
                {stats.historial.slice(0, 15).reverse().map((dia) => {
                  const maxIngresos = Math.max(...stats.historial.map(h => h.ingresos))
                  const altura = dia.ingresos > 0 ? (dia.ingresos / maxIngresos) * 150 : 10
                  
                  return (
                    <div key={dia.fecha} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-12 bg-orange-500 rounded-t hover:bg-orange-600 transition-colors cursor-pointer"
                        style={{ height: `${altura}px` }}
                        title={`${dia.fecha}: $${dia.ingresos.toLocaleString('es-MX')}`}
                      />
                      <span className="text-xs text-muted-foreground rotate-45 origin-top-left">
                        {new Date(dia.fecha).getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay historial disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Pagos Recientes */}
      <div className="mb-6">
        <PagosRecientesTable />
      </div>
    </DashboardPageLayout>
    </RoleGuard>
  )
}
