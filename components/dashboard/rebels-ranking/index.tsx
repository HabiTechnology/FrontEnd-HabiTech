"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import DashboardCard from "@/components/dashboard/card"
import { cn } from "@/lib/utils"

interface RankingItem {
  posicion: number
  apartamento: string
  familia: string
  renta: number
  eficiencia: number
  estadoPagos: string
  nuevosIngresos: number
}

export default function RebelsRanking() {
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevosCount, setNuevosCount] = useState(0)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch("/api/dashboard/ranking")
        const data = await response.json()
        setRanking(data.ranking || [])
        // Contar cuántos tienen nuevos ingresos
        const count = data.ranking?.reduce((sum: number, item: RankingItem) => sum + (item.nuevosIngresos > 0 ? 1 : 0), 0) || 0
        setNuevosCount(count)
      } catch (error) {
        console.error("Error fetching ranking:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchRanking, 300000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <DashboardCard title="EFICIENCIA POR PISO" intent="default">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-16 rounded" />
          ))}
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard
      title="EFICIENCIA POR PISO"
      intent="default"
      addon={nuevosCount > 0 ? <Badge variant="outline-warning">{nuevosCount} NUEVOS</Badge> : undefined}
    >
      <div className="space-y-4">
        {ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos de ranking disponibles
          </p>
        ) : (
          ranking.map((item) => (
            <div key={item.posicion} className="flex items-center justify-between message-divider first:border-t-0 first:pt-0 first:mt-0">
              <div className="flex items-center gap-1 w-full">
                <div
                  className={cn(
                    "flex items-center justify-center rounded text-sm font-bold px-1.5 mr-1 md:mr-2",
                    item.posicion === 1
                      ? "h-10 bg-primary text-primary-foreground"
                      : "h-8 bg-secondary text-secondary-foreground",
                  )}
                >
                  {item.posicion}
                </div>
                <div
                  className={cn(
                    "rounded-lg overflow-hidden bg-muted flex items-center justify-center",
                    item.posicion === 1 ? "size-14 md:size-16" : "size-10 md:size-12",
                  )}
                >
                  <div className="text-xl font-bold text-primary">{item.apartamento}</div>
                </div>
                <div
                  className="flex flex-col justify-center gap-0.5 px-2 md:px-3 truncate flex-1"
                >
                  <h3
                    className={cn(
                      "truncate",
                      item.posicion === 1
                        ? "text-base md:text-lg font-bold text-foreground"
                        : "text-sm md:text-base font-semibold text-foreground",
                    )}
                  >
                    FAMILIA {item.familia.split(' ')[1]?.toUpperCase() || item.familia.toUpperCase()}
                  </h3>
                  <p
                    className={cn(
                      "truncate",
                      item.posicion === 1
                        ? "text-xs md:text-sm font-medium text-muted-foreground"
                        : "text-xs text-muted-foreground",
                    )}
                  >
                    APT {item.apartamento} - ${item.renta.toLocaleString()}/mes
                    <span className="hidden sm:inline"> - <span className="text-success">{item.estadoPagos}</span></span>
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-md text-center leading-tight px-1 md:px-3 py-1 font-mono text-foreground",
                    item.posicion === 1
                      ? "text-base md:text-xl font-bold bg-primary/20"
                      : "text-xs md:text-sm font-semibold bg-secondary",
                  )}
                >
                  {item.eficiencia}% EFICIENCIA
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  )
}
