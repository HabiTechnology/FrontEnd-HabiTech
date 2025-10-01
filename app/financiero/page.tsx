"use client"

import { useEffect, useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CreditCard, Users, Wrench, Zap, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface FinancialSummary {
  periodo: string
  ingresos: {
    total: number
    cantidad: number
    porTipo: Array<{
      tipo: string
      total: number
      cantidad: number
    }>
  }
  gastos: {
    total: number
    mantenimiento: {
      total: number
      descripcion: string
    }
    personal: {
      total: number
      cantidad: number
      descripcion: string
    }
    servicios: {
      total: number
      desglose: Array<{
        tipo: string
        consumo: number
        registros: number
      }>
    }
  }
  balance: {
    neto: number
    porcentaje: number
  }
  pendientes: {
    total: number
    cantidad: number
  }
  vencidos: {
    total: number
    cantidad: number
  }
}

interface Pago {
  id: number
  monto: string
  tipo_pago: string
  estado: string
  fecha_pago: string | null
  fecha_vencimiento: string | null
  metodo_pago: string | null
  descripcion: string | null
  residente: string | null
  residente_correo: string | null
  numero_departamento: string | null
  piso: number | null
}

const COLORS = {
  primary: "#0ea5e9",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899"
}

export default function FinancialDashboard() {
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'año'>('mes')
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [tendencias, setTendencias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [periodo])

  const fetchFinancialData = async () => {
    setLoading(true)
    try {
      // Primero, diagnóstico para ver qué hay en la DB
      console.log("🔍 Fetching diagnostics...")
      const diagnosticRes = await fetch('/api/financiero/diagnostico')
      const diagnosticData = await diagnosticRes.json()
      console.log("📊 Diagnostic results:", diagnosticData)

      // Fetch resumen financiero
      console.log("💰 Fetching financial summary...")
      const resumenRes = await fetch(`/api/financiero/resumen?periodo=${periodo}`)
      const resumenData = await resumenRes.json()
      console.log("💰 Summary data received:", resumenData)
      setSummary(resumenData)

      // Fetch todos los pagos
      console.log("💳 Fetching payments...")
      const pagosRes = await fetch('/api/financiero/pagos?limit=50')
      const pagosData = await pagosRes.json()
      console.log("💳 Payments data received:", pagosData)
      setPagos(pagosData.data || [])

      // Fetch tendencias
      console.log("📈 Fetching trends...")
      const tendenciasRes = await fetch('/api/financiero/tendencias?meses=12')
      const tendenciasData = await tendenciasRes.json()
      console.log("📈 Trends data received:", tendenciasData)
      setTendencias(tendenciasData.data || [])

    } catch (error) {
      console.error("❌ Error fetching financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'pagado': { variant: 'default', label: 'Pagado' },
      'pendiente': { variant: 'secondary', label: 'Pendiente' },
      'vencido': { variant: 'destructive', label: 'Vencido' },
      'cancelado': { variant: 'outline', label: 'Cancelado' }
    }
    const config = variants[estado] || variants['pendiente']
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTipoPagoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      'mantenimiento': 'Mantenimiento',
      'renta': 'Renta',
      'servicio': 'Servicio',
      'multa': 'Multa',
      'deposito': 'Depósito',
      'otro': 'Otro'
    }
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>
  }

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Dashboard Financiero",
          description: "Gestión completa de ingresos y gastos del edificio",
          icon: Wallet
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando datos financieros...</p>
          </div>
        </div>
      </DashboardPageLayout>
    )
  }

  if (!summary) {
    return (
      <DashboardPageLayout
        header={{
          title: "Dashboard Financiero",
          description: "Gestión completa de ingresos y gastos del edificio",
          icon: Wallet
        }}
      >
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Error al cargar datos financieros</p>
        </div>
      </DashboardPageLayout>
    )
  }

  // Preparar datos para gráficos
  const gastosDesglose = [
    { name: 'Mantenimiento', value: summary.gastos?.mantenimiento?.total || 0, color: COLORS.warning },
    { name: 'Personal', value: summary.gastos?.personal?.total || 0, color: COLORS.purple },
    { name: 'Servicios', value: summary.gastos?.servicios?.total || 0, color: COLORS.primary }
  ]

  const ingresosDesglose = summary.ingresos?.porTipo?.map((item, index) => ({
    name: item.tipo,
    value: item.total,
    cantidad: item.cantidad
  })) || []

  return (
    <DashboardPageLayout
      header={{
        title: "Dashboard Financiero",
        description: "Gestión completa de ingresos y gastos del edificio",
        icon: Wallet
      }}
    >
      {/* Selector de Período */}
      <div className="flex justify-end mb-4">
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
          <TabsList>
            <TabsTrigger value="mes">Este Mes</TabsTrigger>
            <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
            <TabsTrigger value="año">Año</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Cards de Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.ingresos?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.ingresos?.cantidad || 0} pagos recibidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.gastos?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Operación del edificio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <DollarSign className={`h-4 w-4 ${(summary.balance?.neto || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary.balance?.neto || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.balance?.neto || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.balance?.porcentaje || 0}% del ingreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.pendientes?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.pendientes?.cantidad || 0} pagos pendientes
            </p>
            {(summary.vencidos?.cantidad || 0) > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {summary.vencidos.cantidad} vencidos ({formatCurrency(summary.vencidos.total)})
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        {/* Gráfico de Tendencias */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tendencia de Ingresos vs Gastos</CardTitle>
            <CardDescription className="text-xs">Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tendencias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_corto" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(parseFloat(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke={COLORS.success} 
                  strokeWidth={2}
                  name="Ingresos"
                />
                <Line 
                  type="monotone" 
                  dataKey="gastos_mantenimiento" 
                  stroke={COLORS.danger} 
                  strokeWidth={2}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribución de Gastos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribución de Gastos</CardTitle>
            <CardDescription className="text-xs">Período actual</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gastosDesglose}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(Number(value))}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gastosDesglose.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Ingresos por Tipo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ingresos por Tipo de Pago</CardTitle>
            <CardDescription className="text-xs">Período actual</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ingresosDesglose}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(parseFloat(value))} />
                <Legend />
                <Bar dataKey="value" fill={COLORS.primary} name="Monto Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detalle de Gastos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalle de Gastos</CardTitle>
            <CardDescription className="text-xs">Período actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Mantenimiento</span>
              </div>
              <span className="text-sm font-bold text-orange-600">
                {formatCurrency(summary.gastos?.mantenimiento?.total || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Personal ({summary.gastos?.personal?.cantidad || 0})</span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {formatCurrency(summary.gastos?.personal?.total || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Servicios</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(summary.gastos?.servicios?.total || 0)}
              </span>
            </div>
            {(summary.gastos?.servicios?.desglose || []).map((servicio, index) => (
              <div key={index} className="pl-6 flex items-center justify-between text-xs text-muted-foreground">
                <span className="capitalize">{servicio.tipo}</span>
                <span>{servicio.consumo.toFixed(2)} unidades</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Todos los Pagos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registro de Pagos</CardTitle>
          <CardDescription className="text-xs">Todos los pagos del edificio</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-auto" style={{ maxHeight: '500px' }}>
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Residente</TableHead>
                  <TableHead>Depto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  pagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell className="font-mono text-xs">#{pago.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{pago.residente || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{pago.residente_correo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pago.numero_departamento ? (
                          <Badge variant="outline">{pago.numero_departamento}</Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{getTipoPagoBadge(pago.tipo_pago)}</TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(parseFloat(pago.monto))}
                      </TableCell>
                      <TableCell>{getEstadoBadge(pago.estado)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(pago.fecha_vencimiento)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(pago.fecha_pago)}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {pago.metodo_pago || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
