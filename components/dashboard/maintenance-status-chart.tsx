"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface MaintenanceStatusData {
  estado: string
  cantidad: number
  [key: string]: string | number
}

export function MaintenanceStatusChart() {
  const [data, setData] = useState<MaintenanceStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/maintenance-status")
        const result = await response.json()
        setData(result.data || [])
        setTotal(result.total || 0)
      } catch (error) {
        console.error("Error fetching maintenance status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 120000) // 2 min
    return () => clearInterval(interval)
  }, [])

  const COLORS = {
    pendiente: "#f59e0b",
    en_proceso: "#3b82f6",
    resuelto: "#10b981",
    cancelado: "#ef4444"
  }

  const LABELS = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    resuelto: "Resuelto",
    cancelado: "Cancelado"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de Mantenimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Estado de Solicitudes de Mantenimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => {
                const estado = entry.estado || entry.name
                const percent = entry.percent || 0
                return `${LABELS[estado as keyof typeof LABELS] || estado}: ${(percent * 100).toFixed(0)}%`
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="cantidad"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.estado as keyof typeof COLORS] || "#8884d8"} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Solicitudes Totales</div>
        </div>
      </CardContent>
    </Card>
  )
}
