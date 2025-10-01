"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface PaymentsByTypeData {
  tipo: string
  total: number
  cantidad: number
}

export function PaymentsByTypeChart() {
  const [data, setData] = useState<PaymentsByTypeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/payments-by-type")
        const result = await response.json()
        setData(result.data || [])
      } catch (error) {
        console.error("Error fetching payments by type:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000) // 5 min
    return () => clearInterval(interval)
  }, [])

  const COLORS = {
    renta: "#3b82f6",
    mantenimiento: "#10b981",
    multa: "#ef4444",
    deposito: "#f59e0b"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos por Tipo</CardTitle>
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
        <CardTitle>💰 Pagos por Tipo (Mes Actual)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="tipo" 
              tick={{ fill: 'hsl(var(--foreground))' }}
              style={{ textTransform: 'capitalize' }}
            />
            <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total']}
            />
            <Bar dataKey="total" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.tipo as keyof typeof COLORS] || "#8884d8"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.tipo} className="text-center p-2 rounded bg-muted/50">
              <div className="text-xs text-muted-foreground capitalize">{item.tipo}</div>
              <div className="font-bold">${item.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{item.cantidad} pagos</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
