"use client"

import React, { useEffect, useState } from 'react'
import DashboardStat from '@/components/dashboard/stat'
import UsersIcon from '@/components/icons/users'
import HomeIcon from '@/components/icons/home'
import { AlertTriangle, Clock } from 'lucide-react'

interface ResidentesStatsData {
  totalResidentes: number
  residentesActivos: number
  departamentosOcupados: number
  solicitudesPendientes: number
}

export default function ResidentesStats() {
  const [stats, setStats] = useState<ResidentesStatsData>({
    totalResidentes: 0,
    residentesActivos: 0,
    departamentosOcupados: 0,
    solicitudesPendientes: 0
  })
  const [loading, setLoading] = useState(true)

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

  return (
    <>
      <DashboardStat
        label="Total Residentes"
        value={stats.totalResidentes.toString()}
        icon={UsersIcon}
      />
      <DashboardStat
        label="Residentes Activos"
        value={stats.residentesActivos.toString()}
        icon={UsersIcon}
      />
      <DashboardStat
        label="Departamentos Ocupados"
        value={stats.departamentosOcupados.toString()}
        icon={HomeIcon}
      />
      <DashboardStat
        label="Solicitudes Pendientes"
        value={stats.solicitudesPendientes.toString()}
        icon={AlertTriangle}
      />
    </>
  )
}
