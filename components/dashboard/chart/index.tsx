"use client"

import * as React from "react"
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import mockDataJson from "@/mock.json"
import { Bullet } from "@/components/ui/bullet"
import type { MockData, TimePeriod } from "@/types/dashboard"

const mockData = mockDataJson as MockData

type ChartDataPoint = {
  date: string
  residentes: number
  visitantes: number
  ingresos: number
}

const chartConfig = {
  residentes: {
    label: "Residentes",
    color: "var(--chart-1)",
  },
  visitantes: {
    label: "Visitantes",
    color: "var(--chart-2)",
  },
  ingresos: {
    label: "Ingresos ($)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export default function DashboardChart() {
  const [activeTab, setActiveTab] = React.useState<TimePeriod>("week")

  const handleTabChange = (value: string) => {
    if (value === "week" || value === "month" || value === "year") {
      setActiveTab(value as TimePeriod)
    }
  }

  const formatYAxisValue = (value: number) => {
    if (value === 0) {
      return ""
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  const renderChart = (data: ChartDataPoint[]) => {
    return (
      <div className="chart-habitech p-3">
        <ChartContainer className="md:aspect-[3/1] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillResidentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-residentes)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-residentes)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillVisitantes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visitantes)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-visitantes)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ingresos)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-ingresos)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="8 8"
              strokeWidth={2}
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className="uppercase text-sm fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={6}
              className="text-sm fill-muted-foreground"
              tickFormatter={formatYAxisValue}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" className="min-w-[200px] px-4 py-3" />}
            />
            <Area
              dataKey="residentes"
              type="linear"
              fill="url(#fillResidentes)"
              fillOpacity={0.4}
              stroke="var(--color-residentes)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="visitantes"
              type="linear"
              fill="url(#fillVisitantes)"
              fillOpacity={0.4}
              stroke="var(--color-visitantes)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="ingresos"
              type="linear"
              fill="url(#fillIngresos)"
              fillOpacity={0.4}
              stroke="var(--color-ingresos)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    )
  }

  return (
    <div className="dashboard-section p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="max-md:gap-4">
        <div className="flex items-center justify-between mb-4 max-md:contents card-divider">
          <TabsList className="max-md:w-full">
            <TabsTrigger value="week">SEMANA</TabsTrigger>
            <TabsTrigger value="month">MES</TabsTrigger>
            <TabsTrigger value="year">AÑO</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-6 max-md:order-1">
            {Object.entries(chartConfig).map(([key, value]) => (
              <ChartLegend key={key} label={value.label} color={value.color} />
            ))}
          </div>
        </div>
        <TabsContent value="week" className="space-y-4">
          {renderChart(mockData.chartData.week)}
        </TabsContent>
        <TabsContent value="month" className="space-y-4">
          {renderChart(mockData.chartData.month)}
        </TabsContent>
        <TabsContent value="year" className="space-y-4">
          {renderChart(mockData.chartData.year)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const ChartLegend = ({
  label,
  color,
}: {
  label: string
  color: string
}) => {
  return (
    <div className="flex items-center gap-2 uppercase">
      <Bullet style={{ backgroundColor: color }} className="rotate-45" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
