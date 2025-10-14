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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <>
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

      {/* Diagrama de Bloques con Datos de Base de Datos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 Análisis Financiero Detallado</CardTitle>
          <CardDescription>Métricas clave de ingresos y gastos del edificio</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Bloque 1: Distribución de Ingresos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.por_tipo.map((tipo) => {
                  const iconColors: Record<string, string> = {
                    renta: 'text-blue-500 bg-blue-500/10',
                    mantenimiento: 'text-green-500 bg-green-500/10',
                    multa: 'text-red-500 bg-red-500/10',
                    deposito: 'text-purple-500 bg-purple-500/10',
                  }
                  
                  return (
                    <div 
                      key={tipo.tipo}
                      className="relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`p-2 rounded-full ${iconColors[tipo.tipo] || 'text-gray-500 bg-gray-500/10'}`}>
                          <Wallet className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {tipo.cantidad} pagos
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground capitalize mb-1">
                        {tipo.tipo.replace('_', ' ')}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ${(tipo.total / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${tipo.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Bloque 2: Estado de Pagos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-lg border p-4 shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completados</p>
                      <p className="text-xs text-muted-foreground">{stats.ingresos.pagos_completados} transacciones</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${(stats.ingresos.confirmados / 1000).toFixed(1)}k
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-lg border p-4 shadow-sm bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-yellow-500/20">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                      <p className="text-xs text-muted-foreground">{stats.ingresos.pagos_pendientes} transacciones</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">
                    ${(stats.ingresos.pendientes / 1000).toFixed(1)}k
                  </p>
                </div>

                {stats.ingresos.pagos_atrasados > 0 && (
                  <div className="relative overflow-hidden rounded-lg border p-4 shadow-sm bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-red-500/20 animate-pulse">
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Atrasados</p>
                        <p className="text-xs text-muted-foreground">{stats.ingresos.pagos_atrasados} transacciones</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                      ¡URGENTE!
                    </p>
                  </div>
                )}
              </div>

              {/* Bloque 3: Métricas Mensuales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-lg border p-6 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Ingreso Mensual Esperado</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    ${(stats.ingresos.total_mes / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">
                    De departamentos ocupados
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-lg border p-6 shadow-sm bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-full bg-orange-500/20">
                      <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Balance del Mes</p>
                  <p className={`text-4xl font-bold mb-1 ${stats.balance.neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(Math.abs(stats.balance.neto) / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.balance.neto >= 0 ? 'Superávit' : 'Déficit'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Total General de Pagos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-500" />
            Total Acumulado en Base de Datos
          </CardTitle>
          <CardDescription>Suma de todos los pagos registrados históricos</CardDescription>
        </CardHeader>
        <CardContent>
          <TotalPagosGeneral />
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

// Componente para mostrar total general
function TotalPagosGeneral() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await fetch("/api/dashboard/total-pagos")
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching total pagos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTotal()
  }, [])

  if (loading) {
    return <div className="h-32 animate-pulse bg-muted rounded" />
  }

  if (!data || !data.total_general) {
    return (
      <div className="text-center p-4 border rounded-lg bg-card">
        <p className="text-muted-foreground">No hay datos financieros disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="text-center p-4 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground mb-2">Total General</p>
        <p className="text-3xl font-bold text-orange-500">
          ${(data.total_general || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{data.cantidad_pagos || 0} pagos</p>
      </div>
      
      <div className="text-center p-4 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground mb-2">Pagados</p>
        <p className="text-3xl font-bold text-green-500">
          ${(data.total_pagados || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{data.pagos_completados || 0} pagos</p>
      </div>
      
      <div className="text-center p-4 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground mb-2">Pendientes</p>
        <p className="text-3xl font-bold text-yellow-500">
          ${(data.total_pendientes || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{data.pagos_pendientes || 0} pagos</p>
      </div>
      
      <div className="text-center p-4 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground mb-2">Atrasados</p>
        <p className="text-3xl font-bold text-red-500">
          ${(data.total_atrasados || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{data.pagos_atrasados || 0} pagos</p>
      </div>
    </div>
  )
}
