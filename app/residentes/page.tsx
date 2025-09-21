"use client"

import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import UsersIcon from "@/components/icons/users"
import HomeIcon from "@/components/icons/home"
import { AlertTriangle } from "lucide-react"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import AnimatedButton from "@/components/animations/animated-button"
import FloatingElement from "@/components/animations/floating-element"
import { useEffect, useState } from "react"

// Import the actual ResidentesTable component
const ResidentesTable = dynamic(() => import("@/components/residentes/residentes-table"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted rounded" />
})

interface ResidentesStatsData {
  totalResidentes: number
  residentesActivos: number
  departamentosOcupados: number
  solicitudesPendientes: number
}

function ResidentesStats() {
  const [stats, setStats] = useState<ResidentesStatsData>({
    totalResidentes: 0,
    residentesActivos: 0,
    departamentosOcupados: 0,
    solicitudesPendientes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/residentes/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching residentes stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </>
    )
  }

  return (
    <>
      <DashboardStat
        label="Total Residentes"
        value={stats.totalResidentes.toString()}
        description="Usuarios registrados"
        icon={UsersIcon}
        intent="neutral"
      />
      
      <DashboardStat
        label="Residentes Activos"
        value={stats.residentesActivos.toString()}
        description="Actualmente viviendo"
        icon={UsersIcon}
        intent="positive"
        direction="up"
      />
      
      <DashboardStat
        label="Departamentos Ocupados"
        value={stats.departamentosOcupados.toString()}
        description="Unidades habitadas"
        icon={HomeIcon}
        intent="neutral"
      />
      
      <DashboardStat
        label="Solicitudes Pendientes"
        value={stats.solicitudesPendientes.toString()}
        description="Requieren atención"
        icon={AlertTriangle}
        intent={stats.solicitudesPendientes > 0 ? "negative" : "positive"}
      />
    </>
  )
}

export default function ResidentesPage() {
  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Gestión de Residentes",
          description: "Administración y seguimiento de residentes del edificio",
          icon: UsersIcon,
        }}
      >
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(3)].map((_, i) => {
            const positions = [
              { top: '15%', left: '10%' },
              { top: '30%', right: '15%' },
              { bottom: '20%', left: '5%' }
            ];
            
            return (
              <FloatingElement key={i} intensity={5} duration={2500 + (i * 400)}>
                <div
                  className="absolute w-16 h-16 bg-blue-500/10 dark:bg-blue-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            );
          })}
        </div>

        <div className="relative z-1">
          {/* Statistics Cards with Stagger Animation */}
          <StaggerAnimation delay={200} staggerDelay={120}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ResidentesStats />
            </div>
          </StaggerAnimation>

          {/* Main Table with Animation */}
          <StaggerAnimation delay={500} staggerDelay={0}>
            <div className="content-panel group hover:shadow-lg transition-all duration-300">
              <ResidentesTable />
            </div>
          </StaggerAnimation>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
