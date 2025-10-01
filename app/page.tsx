"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import { RoleGuard } from "@/components/role-guard"
import BracketsIcon from "@/components/icons/brackets"
import { Users, DollarSign, Building2 } from "lucide-react"

// Lazy load heavy components
const DashboardChart = dynamic(() => import("@/components/dashboard/chart"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded mb-6" />
})

const RebelsRanking = dynamic(() => import("@/components/dashboard/rebels-ranking"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded" />
})

const RecentActivities = dynamic(() => import("@/components/dashboard/recent-activities").then(mod => ({ default: mod.RecentActivities })), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded" />
})

const PagosRecientesTable = dynamic(() => import("@/components/dashboard/pagos-recientes-table").then(mod => ({ default: mod.PagosRecientesTable })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
})

const AnunciosRecientesTable = dynamic(() => import("@/components/dashboard/anuncios-recientes-table").then(mod => ({ default: mod.AnunciosRecientesTable })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
})

const PersonalEdificioManager = dynamic(() => import("@/components/dashboard/personal-edificio-manager").then(mod => ({ default: mod.PersonalEdificioManager })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
})

interface DashboardStats {
  residentes: {
    total: number
    tendencia: "up" | "down" | "neutral"
    porcentaje: number
  }
  ingresos: {
    total: number
    tendencia: "up" | "down" | "neutral"
    porcentaje: number
  }
  ocupacion: {
    porcentaje: number
    ocupados: number
    total: number
  }
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        const data = await response.json()
        
        console.log("📊 Dashboard Stats Response:", data)
        
        if (data.error) {
          console.error("❌ Error from API:", data.error)
          setStats(null)
        } else {
          setStats(data)
        }
        
        const now = new Date()
        setLastUpdate(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
      } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error)
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
    <RoleGuard allowedRoles={['admin', 'resident']}>
      <DashboardPageLayout
        header={{
          title: "Panel de Control - Edificio Inteligente",
          description: `Última actualización ${lastUpdate || "cargando..."}`,
          icon: BracketsIcon,
        }}
      >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-0">
        {loading ? (
          <>
            <div className="animate-pulse bg-muted h-32 rounded" />
            <div className="animate-pulse bg-muted h-32 rounded" />
            <div className="animate-pulse bg-muted h-32 rounded" />
          </>
        ) : stats ? (
          <>
            <DashboardStat
              label="RESIDENTES ACTIVOS"
              value={stats.residentes.total.toString()}
              description="PERSONAS EN EL EDIFICIO HOY"
              icon={Users}
              tag={`${stats.residentes.porcentaje}%`}
              intent={stats.residentes.tendencia === "up" ? "positive" : stats.residentes.tendencia === "down" ? "negative" : "neutral"}
              direction={stats.residentes.tendencia === "neutral" ? undefined : stats.residentes.tendencia}
            />
            <DashboardStat
              label="INGRESOS MENSUALES"
              value={`$${stats.ingresos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              description="PAGOS DE MANTENIMIENTO RECIBIDOS"
              icon={DollarSign}
              tag={`${stats.ingresos.porcentaje}%`}
              intent={stats.ingresos.tendencia === "up" ? "positive" : stats.ingresos.tendencia === "down" ? "negative" : "neutral"}
              direction={stats.ingresos.tendencia === "neutral" ? undefined : stats.ingresos.tendencia}
            />
            <DashboardStat
              label="APARTAMENTOS OCUPADOS"
              value={`${stats.ocupacion.porcentaje}%`}
              description={`OCUPACIÓN ACTUAL DEL EDIFICIO ${stats.ocupacion.ocupados}/${stats.ocupacion.total}`}
              icon={Building2}
              tag={stats.ocupacion.ocupados === stats.ocupacion.total ? "COMPLETO" : ""}
              intent={stats.ocupacion.porcentaje >= 90 ? "positive" : stats.ocupacion.porcentaje >= 70 ? "neutral" : "negative"}
              direction={stats.ocupacion.porcentaje >= 90 ? "up" : undefined}
            />
          </>
        ) : (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            Error al cargar estadísticas
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="mb-6 section-separator">
        <DashboardChart />
      </div>

      {/* Tablas de Datos - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PagosRecientesTable />
        <AnunciosRecientesTable />
      </div>

      {/* Personal del Edificio - Ancho completo */}
      <div className="mb-6">
        <PersonalEdificioManager />
      </div>

      {/* Sección de Ranking y Actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="content-panel lg:col-span-1">
          <RebelsRanking />
        </div>
        <div className="content-panel lg:col-span-1">
          <RecentActivities />
        </div>
      </div>
    </DashboardPageLayout>
    </RoleGuard>
  )
}
