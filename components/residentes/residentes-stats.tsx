"use client"

import React, { useEffect, useState } from 'react'
import DashboardStat from "@/components/dashboard/stat"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCheck, UserX, Users, Home, Building, RefreshCw } from 'lucide-react'
import NumberFlow from "@number-flow/react"
import FloatingElement from "@/components/animations/floating-element"

interface ResidentesStatsData {
  totalResidentes: number
  residentesActivos: number
  residentesInactivos: number
  propietarios: number
  inquilinos: number
  familiares: number
}

type VistaActivos = 'activos' | 'inactivos'
type TipoRelacion = 'propietarios' | 'inquilinos' | 'familiares'

export default function ResidentesStats() {
  const [stats, setStats] = useState<ResidentesStatsData>({
    totalResidentes: 0,
    residentesActivos: 0,
    residentesInactivos: 0,
    propietarios: 0,
    inquilinos: 0,
    familiares: 0
  })
  const [loading, setLoading] = useState(true)
  const [vistaActivos, setVistaActivos] = useState<VistaActivos>('activos')
  const [tipoRelacion, setTipoRelacion] = useState<TipoRelacion>('propietarios')

  useEffect(() => {
    fetchStats()
  }, [])

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

  const toggleVistaActivos = () => {
    setVistaActivos(prev => prev === 'activos' ? 'inactivos' : 'activos')
  }

  const toggleTipoRelacion = () => {
    const tipos: TipoRelacion[] = ['propietarios', 'inquilinos', 'familiares']
    const currentIndex = tipos.indexOf(tipoRelacion)
    const nextIndex = (currentIndex + 1) % tipos.length
    setTipoRelacion(tipos[nextIndex])
  }

  const getValorActual = () => {
    return vistaActivos === 'activos' ? stats.residentesActivos : stats.residentesInactivos
  }

  const getValorTipoRelacion = () => {
    switch (tipoRelacion) {
      case 'propietarios': return stats.propietarios
      case 'inquilinos': return stats.inquilinos
      case 'familiares': return stats.familiares
      default: return 0
    }
  }

  const getIconoTipoRelacion = () => {
    switch (tipoRelacion) {
      case 'propietarios': return Home
      case 'inquilinos': return Building
      case 'familiares': return Users
      default: return Users
    }
  }

  return (
    <>
      {/* Card 1: Total de Residentes - Usa DashboardStat estándar */}
      <DashboardStat
        label="TOTAL RESIDENTES"
        value={stats.totalResidentes.toString()}
        description={`${stats.residentesActivos} activos, ${stats.residentesInactivos} inactivos`}
        icon={Users}
        tag="TOTAL"
        intent="neutral"
        direction="up"
      />

      {/* Card 2: Residentes Activos/Inactivos con botón personalizado */}
      <Card className="stat-card-habitech relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <FloatingElement intensity={3} duration={2000}>
            <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full" />
          </FloatingElement>
        </div>
        
        <CardHeader className="flex items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-2.5 group-hover:text-primary transition-colors duration-300">
            <div className="w-2 h-2 bg-primary rounded-full" />
            {vistaActivos === 'activos' ? 'RESIDENTES ACTIVOS' : 'RESIDENTES INACTIVOS'}
          </CardTitle>
          {vistaActivos === 'activos' ? (
            <UserCheck className="size-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
          ) : (
            <UserX className="size-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
          )}
        </CardHeader>

        <CardContent className="bg-accent/50 backdrop-filter backdrop-blur-sm flex-1 pt-2 md:pt-6 overflow-clip relative border-t border-border/50 z-10">
          <div className="flex items-center justify-between">
            <span className="text-4xl md:text-5xl font-display text-card-foreground">
              <NumberFlow value={getValorActual()} />
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="uppercase bg-habitech-pattern">
                {vistaActivos === 'activos' ? 'ESTE MES' : 'INACTIVOS'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVistaActivos}
                className="h-7 px-2 text-xs hover:bg-primary/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                CAMBIAR
              </Button>
            </div>
          </div>

          <div className="justify-between mt-2">
            <p className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
              Estado {vistaActivos}
            </p>
          </div>

          {/* Marquee Animation */}
          <div className="absolute top-0 right-0 w-14 h-full pointer-events-none overflow-hidden group">
            <div className="flex flex-col transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 text-success animate-marquee-up">
              <div className="flex flex-col-reverse">
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "3s",
                      animationTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)",
                    }}
                    className="text-center text-5xl size-14 font-display leading-none block transition-all duration-700 ease-out animate-marquee-pulse will-change-transform"
                  >
                    ↑
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Tipos de Relación con botón personalizado */}
      <Card className="stat-card-habitech relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <FloatingElement intensity={3} duration={2000}>
            <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full" />
          </FloatingElement>
        </div>
        
        <CardHeader className="flex items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-2.5 group-hover:text-primary transition-colors duration-300">
            <div className="w-2 h-2 bg-primary rounded-full" />
            {tipoRelacion.toUpperCase()}
          </CardTitle>
          {React.createElement(getIconoTipoRelacion(), { 
            className: "size-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" 
          })}
        </CardHeader>

        <CardContent className="bg-accent/50 backdrop-filter backdrop-blur-sm flex-1 pt-2 md:pt-6 overflow-clip relative border-t border-border/50 z-10">
          <div className="flex items-center justify-between">
            <span className="text-4xl md:text-5xl font-display text-card-foreground">
              <NumberFlow value={getValorTipoRelacion()} />
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="uppercase bg-habitech-pattern">
                FINALIZADAS
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTipoRelacion}
                className="h-7 px-2 text-xs hover:bg-primary/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                CAMBIAR
              </Button>
            </div>
          </div>

          <div className="justify-between mt-2">
            <p className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
              {`De ${stats.totalResidentes} residentes totales`}
            </p>
          </div>

          {/* Marquee Animation */}
          <div className="absolute top-0 right-0 w-14 h-full pointer-events-none overflow-hidden group">
            <div className="flex flex-col transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 text-success animate-marquee-up">
              <div className="flex flex-col-reverse">
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "3s",
                      animationTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)",
                    }}
                    className="text-center text-5xl size-14 font-display leading-none block transition-all duration-700 ease-out animate-marquee-pulse will-change-transform"
                  >
                    ↑
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}