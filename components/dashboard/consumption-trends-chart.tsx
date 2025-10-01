"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ConsumptionData {
  fecha: string
  agua: number
  luz: number
  gas: number
}

export function ConsumptionTrendsChart() {
  const [data, setData] = useState<ConsumptionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/consumption-trends")
        const result = await response.json()
        setData(result.data || [])
      } catch (error) {
        console.error("Error fetching consumption trends:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000) // 5 min
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consumo de Servicios</CardTitle>
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
        <CardTitle>📊 Tendencia de Consumo (Últimos 7 Días)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="fecha" 
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="agua" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Agua (m³)"
              dot={{ fill: '#3b82f6' }}
            />
            <Line 
              type="monotone" 
              dataKey="luz" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Luz (kWh)"
              dot={{ fill: '#f59e0b' }}
            />
            <Line 
              type="monotone" 
              dataKey="gas" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Gas (m³)"
              dot={{ fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
