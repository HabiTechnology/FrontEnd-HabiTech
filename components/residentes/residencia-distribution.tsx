"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { mockDepartamentosOcupacion } from "@/data/residentes-mock"
import { Bullet } from "@/components/ui/bullet"
import { Badge } from "@/components/ui/badge"

const chartConfig = {
  ocupados: {
    label: "Departamentos Ocupados",
    color: "#10b981",
  },
  disponibles: {
    label: "Departamentos Disponibles", 
    color: "#a0aab4",
  },
} satisfies ChartConfig

export default function ResidenciaDistribution() {
  // Agrupar por piso y contar ocupación
  const datosPorPiso = mockDepartamentosOcupacion.reduce((acc, dept) => {
    const pisoKey = `Piso ${dept.piso}`
    const pisoExistente = acc.find(p => p.piso === pisoKey)
    if (pisoExistente) {
      if (dept.ocupado) {
        pisoExistente.ocupados += 1
      } else {
        pisoExistente.disponibles += 1
      }
    } else {
      acc.push({
        piso: pisoKey,
        ocupados: dept.ocupado ? 1 : 0,
        disponibles: dept.ocupado ? 0 : 1,
      })
    }
    return acc
  }, [] as Array<{ piso: string; ocupados: number; disponibles: number }>)

  // Estadísticas generales
  const totalDepartamentos = mockDepartamentosOcupacion.length
  const ocupados = mockDepartamentosOcupacion.filter(d => d.ocupado).length
  const disponibles = totalDepartamentos - ocupados
  const porcentajeOcupacion = Math.round((ocupados / totalDepartamentos) * 100)

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="border-b border-border/30 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-card-foreground">
          <Bullet variant="default" />
          DISTRIBUCIÓN POR PISO
        </CardTitle>
        
        {/* Estadísticas resumidas */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{ocupados}</div>
            <div className="text-sm text-muted-foreground">Ocupados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{disponibles}</div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </div>
        </div>
        
        <div className="flex justify-center mt-2">
          <Badge variant="outline-success" className="text-sm">
            {porcentajeOcupacion}% Ocupación
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datosPorPiso} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="piso" 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Bar
                dataKey="ocupados"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                name="Ocupados"
              />
              <Bar
                dataKey="disponibles"
                fill="#a0aab4"
                radius={[2, 2, 0, 0]}
                name="Disponibles"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Leyenda personalizada */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {Object.entries(chartConfig).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: value.color }}
              />
              <span className="text-sm text-muted-foreground">{value.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
