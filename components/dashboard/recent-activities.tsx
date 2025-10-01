"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Wrench, Calendar, Megaphone } from "lucide-react"

interface Activity {
  id: number
  tipo: string
  usuario: string
  descripcion: string
  monto: number | null
  fecha: string
  estado: string
}

const iconMap = {
  pago: DollarSign,
  mantenimiento: Wrench,
  reserva: Calendar,
  anuncio: Megaphone,
}

const colorMap = {
  completado: "bg-green-500/10 text-green-500 border-green-500/20",
  pagado: "bg-green-500/10 text-green-500 border-green-500/20",
  pendiente: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  en_proceso: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  confirmada: "bg-green-500/10 text-green-500 border-green-500/20",
  activo: "bg-green-500/10 text-green-500 border-green-500/20",
  resuelto: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelado: "bg-red-500/10 text-red-500 border-red-500/20",
  rechazado: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/dashboard/activities")
        const data = await response.json()
        setActivities(data.actividades || [])
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchActivities, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffInMinutes < 1) return "Hace un momento"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-muted h-16 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay actividades recientes
              </p>
            ) : (
              activities.map((activity) => {
                const Icon = iconMap[activity.tipo as keyof typeof iconMap] || Clock
                const colorClass = colorMap[activity.estado as keyof typeof colorMap] || colorMap.pendiente

                return (
                  <div
                    key={`${activity.tipo}-${activity.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="mt-0.5 p-2 rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {activity.usuario}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.descripcion}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${colorClass} text-xs shrink-0`}>
                          {activity.estado.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(activity.fecha)}</span>
                        {activity.monto && (
                          <span className="font-medium text-green-500">
                            ${activity.monto.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
