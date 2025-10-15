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
