"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import { RoleGuard } from "@/components/role-guard"
import BracketsIcon from "@/components/icons/brackets"
import { Users, DollarSign, Building2, Wrench, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Lazy load heavy components
const DashboardChart = dynamic(() => import("@/components/dashboard/chart"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded mb-6" />
})

const AnunciosRecientesTable = dynamic(() => import("@/components/dashboard/anuncios-recientes-table").then(mod => ({ default: mod.AnunciosRecientesTable })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
})

const PersonalEdificioManager = dynamic(() => import("@/components/dashboard/personal-edificio-manager").then(mod => ({ default: mod.PersonalEdificioManager })), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted rounded" />
})

interface EdificioStats {
  departamentos: {
    total: number
    ocupados: number
    disponibles: number
    en_mantenimiento: number
    porcentaje_ocupacion: number
  }
  residentes: {
    total: number
    propietarios: number
    inquilinos: number
  }
  personal: {
    total: number
    seguridad: number
    limpieza: number
    mantenimiento: number
    administracion: number
  }
  mantenimiento: {
    total: number
    pendientes: number
    en_proceso: number
  }
  areas_comunes: {
    total: number
    disponibles: number
    ocupadas: number
  }
  accesos_hoy: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<EdificioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/edificio")
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
              label="DEPARTAMENTOS"
              value={stats.departamentos.ocupados.toString()}
              description={`${stats.departamentos.disponibles} DISPONIBLES • ${stats.departamentos.total} TOTAL`}
              icon={Building2}
              tag={`${stats.departamentos.porcentaje_ocupacion}%`}
              intent={stats.departamentos.porcentaje_ocupacion >= 80 ? "positive" : "neutral"}
              direction={stats.departamentos.porcentaje_ocupacion >= 80 ? "up" : undefined}
            />
            <DashboardStat
              label="RESIDENTES ACTIVOS"
              value={stats.residentes.total.toString()}
              description={`${stats.residentes.propietarios} PROPIETARIOS • ${stats.residentes.inquilinos} INQUILINOS`}
              icon={Users}
              tag="ACTIVOS"
              intent="positive"
            />
            <DashboardStat
              label="PERSONAL EDIFICIO"
              value={stats.personal.total.toString()}
              description={`SEGURIDAD • LIMPIEZA • MANTENIMIENTO • ADMIN`}
              icon={Users}
              tag={`${stats.personal.seguridad + stats.personal.mantenimiento} EN SERVICIO`}
              intent="neutral"
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

      {/* Gráficos del Edificio - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ocupación de Departamentos - Diagrama Circular */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              Ocupación de Departamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="flex flex-col items-center">
                {/* Diagrama de dona circular */}
                <div className="relative w-48 h-48 mb-6">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Círculo de fondo */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                    />
                    
                    {/* Segmento Ocupados (naranja sutil) */}
                    {stats.departamentos.ocupados > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.8)"
                        strokeWidth="12"
                        strokeDasharray={`${(stats.departamentos.ocupados / stats.departamentos.total) * 251.2} 251.2`}
                        strokeDashoffset="0"
                      />
                    )}
                    
                    {/* Segmento Disponibles (azul sutil del tema) */}
                    {stats.departamentos.disponibles > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(0, 123, 255, 0.7)"
                        strokeWidth="12"
                        strokeDasharray={`${(stats.departamentos.disponibles / stats.departamentos.total) * 251.2} 251.2`}
                        strokeDashoffset={`-${(stats.departamentos.ocupados / stats.departamentos.total) * 251.2}`}
                      />
                    )}
                    
                    {/* Segmento Mantenimiento (gris/azul sutil) */}
                    {stats.departamentos.en_mantenimiento > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(160, 170, 180, 0.6)"
                        strokeWidth="12"
                        strokeDasharray={`${(stats.departamentos.en_mantenimiento / stats.departamentos.total) * 251.2} 251.2`}
                        strokeDashoffset={`-${((stats.departamentos.ocupados + stats.departamentos.disponibles) / stats.departamentos.total) * 251.2}`}
                      />
                    )}
                  </svg>
                  
                  {/* Centro del círculo */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{stats.departamentos.total}</span>
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(249, 115, 22, 0.8)' }} />
                      <span className="text-xs font-medium">Ocupados</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'rgba(249, 115, 22, 0.9)' }}>{stats.departamentos.ocupados}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((stats.departamentos.ocupados / stats.departamentos.total) * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0, 123, 255, 0.7)' }} />
                      <span className="text-xs font-medium">Disponibles</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'rgba(0, 123, 255, 0.9)' }}>{stats.departamentos.disponibles}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((stats.departamentos.disponibles / stats.departamentos.total) * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(160, 170, 180, 0.7)' }} />
                      <span className="text-xs font-medium">Mantto.</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: 'rgba(160, 170, 180, 0.9)' }}>{stats.departamentos.en_mantenimiento}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((stats.departamentos.en_mantenimiento / stats.departamentos.total) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando...</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Mantenimiento - Diagrama de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              Solicitudes de Mantenimiento
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            {stats && stats.mantenimiento ? (
              <div className="space-y-6">
                {/* Total General */}
                <div className="text-center pb-4 border-b border-border">
                  <div className="text-5xl font-bold" style={{ color: 'rgba(249, 115, 22, 0.9)' }}>{stats.mantenimiento.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total de Solicitudes</div>
                </div>

                {/* Barras de estado */}
                <div className="space-y-6">
                  {/* Completadas (calculado) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(0, 123, 255, 0.7)' }} />
                        <span className="text-sm font-medium">Completadas</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: 'rgba(0, 123, 255, 0.9)' }}>
                        {stats.mantenimiento.total - stats.mantenimiento.pendientes - stats.mantenimiento.en_proceso}
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${stats.mantenimiento.total > 0 
                            ? ((stats.mantenimiento.total - stats.mantenimiento.pendientes - stats.mantenimiento.en_proceso) / stats.mantenimiento.total) * 100 
                            : 0}%`,
                          background: 'linear-gradient(to right, rgba(0, 123, 255, 0.8), rgba(0, 123, 255, 0.5))'
                        }}
                      />
                    </div>
                  </div>

                  {/* En Proceso */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(249, 115, 22, 0.7)' }} />
                        <span className="text-sm font-medium">En Proceso</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: 'rgba(249, 115, 22, 0.9)' }}>{stats.mantenimiento.en_proceso}</span>
                    </div>
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${stats.mantenimiento.total > 0 
                            ? (stats.mantenimiento.en_proceso / stats.mantenimiento.total) * 100 
                            : 0}%`,
                          background: 'linear-gradient(to right, rgba(249, 115, 22, 0.8), rgba(249, 115, 22, 0.5))'
                        }}
                      />
                    </div>
                  </div>

                  {/* Pendientes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(160, 170, 180, 0.7)' }} />
                        <span className="text-sm font-medium">Pendientes</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: 'rgba(160, 170, 180, 0.9)' }}>{stats.mantenimiento.pendientes}</span>
                    </div>
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${stats.mantenimiento.total > 0 
                            ? (stats.mantenimiento.pendientes / stats.mantenimiento.total) * 100 
                            : 0}%`,
                          background: 'linear-gradient(to right, rgba(160, 170, 180, 0.8), rgba(160, 170, 180, 0.5))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando...</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Áreas Comunes - Diagrama de Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Estado de Áreas Comunes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.areas_comunes ? (
              <div className="space-y-6">
                {/* Visualización de dos semicírculos */}
                <div className="flex justify-around items-end py-4">
                  {/* Disponibles */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 100 100" className="transform rotate-180">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="15"
                          strokeDasharray="125.6 251.2"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(0, 123, 255, 0.7)"
                          strokeWidth="15"
                          strokeDasharray={`${stats.areas_comunes.total > 0 
                            ? (stats.areas_comunes.disponibles / stats.areas_comunes.total) * 125.6 
                            : 0} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-end justify-center pb-2">
                        <span className="text-2xl font-bold" style={{ color: 'rgba(0, 123, 255, 0.9)' }}>{stats.areas_comunes.disponibles}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium mt-2">Disponibles</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.areas_comunes.total > 0 
                        ? Math.round((stats.areas_comunes.disponibles / stats.areas_comunes.total) * 100) 
                        : 0}%
                    </span>
                  </div>

                  {/* Ocupadas */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 100 100" className="transform rotate-180">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="15"
                          strokeDasharray="125.6 251.2"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(249, 115, 22, 0.7)"
                          strokeWidth="15"
                          strokeDasharray={`${stats.areas_comunes.total > 0 
                            ? (stats.areas_comunes.ocupadas / stats.areas_comunes.total) * 125.6 
                            : 0} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-end justify-center pb-2">
                        <span className="text-2xl font-bold" style={{ color: 'rgba(249, 115, 22, 0.9)' }}>{stats.areas_comunes.ocupadas}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium mt-2">Ocupadas</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.areas_comunes.total > 0 
                        ? Math.round((stats.areas_comunes.ocupadas / stats.areas_comunes.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>

                {/* Estadística total */}
                <div className="text-center pt-4 border-t">
                  <div className="text-4xl font-bold">{stats.areas_comunes.total}</div>
                  <div className="text-sm text-muted-foreground">Total de Áreas Comunes</div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando...</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribución de Personal - Gráfico de Barras Horizontal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Distribución de Personal
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            {stats && stats.personal ? (
              <div className="space-y-6">
                {/* Total */}
                <div className="text-center pb-4 border-b border-border">
                  <div className="text-5xl font-bold" style={{ color: 'rgba(249, 115, 22, 0.9)' }}>{stats.personal.total}</div>
                  <div className="text-sm text-muted-foreground mt-1">Personal Total del Edificio</div>
                </div>

                {/* Barras por cargo */}
                <div className="space-y-4">
                  {[
                    { cargo: 'Seguridad', cantidad: stats.personal.seguridad, colorStart: 'rgba(0, 123, 255, 0.8)', colorEnd: 'rgba(0, 123, 255, 0.5)', dotColor: 'rgba(0, 123, 255, 0.7)' },
                    { cargo: 'Limpieza', cantidad: stats.personal.limpieza, colorStart: 'rgba(160, 170, 180, 0.8)', colorEnd: 'rgba(160, 170, 180, 0.5)', dotColor: 'rgba(160, 170, 180, 0.7)' },
                    { cargo: 'Mantenimiento', cantidad: stats.personal.mantenimiento, colorStart: 'rgba(249, 115, 22, 0.8)', colorEnd: 'rgba(249, 115, 22, 0.5)', dotColor: 'rgba(249, 115, 22, 0.7)' },
                    { cargo: 'Administración', cantidad: stats.personal.administracion, colorStart: 'rgba(0, 123, 255, 0.6)', colorEnd: 'rgba(0, 123, 255, 0.3)', dotColor: 'rgba(0, 123, 255, 0.5)' }
                  ].map(({ cargo, cantidad, colorStart, colorEnd, dotColor }) => {
                    const porcentaje = stats.personal.total > 0 
                      ? Math.round((cantidad / stats.personal.total) * 100) 
                      : 0
                    
                    return (
                      <div key={cargo}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dotColor }} />
                            <span className="text-sm font-medium">{cargo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{cantidad}</span>
                            <span className="text-xs text-muted-foreground">({porcentaje}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-secondary h-6 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ 
                              width: `${porcentaje}%`,
                              background: `linear-gradient(to right, ${colorStart}, ${colorEnd})`
                            }}
                          >
                            {porcentaje > 10 && (
                              <span className="text-xs font-semibold text-white opacity-80">{cantidad}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Anuncios */}
      <div className="mb-6">
        <AnunciosRecientesTable />
      </div>

      {/* Personal del Edificio - Ancho completo */}
      <div className="mb-6">
        <PersonalEdificioManager />
      </div>
    </DashboardPageLayout>
    </RoleGuard>
  )
}
