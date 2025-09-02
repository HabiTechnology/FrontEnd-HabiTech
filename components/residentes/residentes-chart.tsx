"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { mockResidenciaData } from "@/data/residentes-mock"
import { Bullet } from "@/components/ui/bullet"

const chartConfig = {
  nuevosResidentes: {
    label: "Nuevos Residentes",
    color: "#007bff",
  },
  bajas: {
    label: "Bajas",
    color: "#ef4444",
  },
  activos: {
    label: "Total Activos",
    color: "#10b981",
  },
} satisfies ChartConfig

export default function ResidentesChart() {
  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="border-b border-border/30 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-card-foreground">
          <Bullet variant="default" />
          EVOLUCIÓN DE RESIDENTES 2024
        </CardTitle>
        <div className="flex items-center gap-6 mt-2">
          {Object.entries(chartConfig).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: value.color }}
              />
              <span className="text-sm text-muted-foreground">{value.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockResidenciaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="mes" 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Line
                type="monotone"
                dataKey="nuevosResidentes"
                stroke="#007bff"
                strokeWidth={2}
                dot={{ fill: "#007bff", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="bajas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="activos"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
