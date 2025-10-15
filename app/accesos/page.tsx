"use client"

import { useEffect, useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  LogIn, 
  LogOut, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Filter,
  RefreshCw,
  ArrowUpDown,
  Search,
  Shield,
  FileText
} from "lucide-react"
import { PageTransition } from "@/components/animations/page-transition"
import FloatingElement from "@/components/animations/floating-element"
import { generarPDFAccesosPreview } from "@/lib/pdf"
import { useToast } from "@/hooks/use-toast"

interface RegistroAcceso {
  id: number
  usuario_id: number
  usuario_nombre: string
  usuario_apellido: string
  departamento_numero: string | null
  dispositivo_id: number | null
  tipo: 'entrada' | 'salida'
  fecha_hora: string
}

export default function AccesosPage() {
  const [registros, setRegistros] = useState<RegistroAcceso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'salida'>('todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [ordenamiento, setOrdenamiento] = useState<'desc' | 'asc'>('desc')
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAccesos()
  }, [])

  const fetchAccesos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accesos')
      const data = await response.json()
      setRegistros(data.registros || [])
    } catch (error) {
      console.error("Error fetching accesos:", error)
    } finally {
      setLoading(false)
    }
  }

  const registrosFiltrados = registros
    .filter(r => filtroTipo === 'todos' || r.tipo === filtroTipo)
    .filter(r => {
      if (!filtroFecha) return true
      const fecha = new Date(r.fecha_hora).toISOString().split('T')[0]
      return fecha === filtroFecha
    })
    .filter(r => {
      if (!busqueda) return true
      const searchLower = busqueda.toLowerCase()
      return (
        r.usuario_nombre.toLowerCase().includes(searchLower) ||
        r.usuario_apellido.toLowerCase().includes(searchLower) ||
        r.departamento_numero?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.fecha_hora).getTime()
      const dateB = new Date(b.fecha_hora).getTime()
      return ordenamiento === 'desc' ? dateB - dateA : dateA - dateB
    })

  const formatFechaHora = (fechaHora: string) => {
    const date = new Date(fechaHora)
    const fecha = date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
    const hora = date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return { fecha, hora }
  }

  const exportarPDF = async () => {
    try {
      setGenerandoPDF(true)
      
      toast({
        title: "📄 Generando PDF",
        description: "Preparando reporte de accesos...",
      })

      // Preparar datos para el PDF
      const datosParaPDF = registrosFiltrados.map(r => ({
        id: r.id,
        usuario_nombre: r.usuario_nombre,
        usuario_apellido: r.usuario_apellido,
        departamento_numero: r.departamento_numero,
        tipo: r.tipo,
        fecha_hora: r.fecha_hora
      }))

      // Generar PDF con preview
      await generarPDFAccesosPreview(
        datosParaPDF,
        `registros-acceso-${new Date().toISOString().split('T')[0]}.pdf`
      )

      toast({
        title: "✅ PDF Generado",
        description: `Se generó el reporte con ${datosParaPDF.length} registros`,
      })
    } catch (error) {
      console.error("Error generando PDF:", error)
      toast({
        variant: "destructive",
        title: "❌ Error",
        description: "No se pudo generar el PDF. Intenta nuevamente.",
      })
    } finally {
      setGenerandoPDF(false)
    }
  }

  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Registro de Accesos",
          description: "Control y monitoreo de entradas y salidas del edificio",
          icon: Shield,
        }}
      >
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(4)].map((_, i) => {
            const positions = [
              { top: '10%', left: '12%' },
              { top: '30%', right: '8%' },
              { bottom: '35%', left: '5%' },
              { bottom: '15%', right: '15%' }
            ]
            
            return (
              <FloatingElement key={i} intensity={4} duration={3500 + (i * 300)}>
                <div
                  className="absolute w-12 h-12 bg-indigo-500/10 dark:bg-indigo-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            )
          })}
        </div>

        <div className="relative z-1">
          {/* Filtros y Búsqueda */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros de Búsqueda
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Filtra y busca registros de acceso específicos
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAccesos}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportarPDF}
                    disabled={registrosFiltrados.length === 0 || generandoPDF}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {generandoPDF ? 'Generando...' : 'Exportar PDF'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {/* Búsqueda por nombre */}
                <div className="space-y-2">
                  <Label htmlFor="busqueda">Buscar Residente</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="busqueda"
                      placeholder="Nombre, apellido o depto..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Filtro por tipo */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Acceso</Label>
                  <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entrada">
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4 text-emerald-600" />
                          Entradas
                        </div>
                      </SelectItem>
                      <SelectItem value="salida">
                        <div className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-rose-600" />
                          Salidas
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por fecha */}
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                  />
                </div>

                {/* Ordenamiento */}
                <div className="space-y-2">
                  <Label htmlFor="orden">Ordenar por</Label>
                  <Select value={ordenamiento} onValueChange={(v) => setOrdenamiento(v as any)}>
                    <SelectTrigger id="orden">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Más reciente primero</SelectItem>
                      <SelectItem value="asc">Más antiguo primero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumen de filtros activos */}
              {(filtroTipo !== 'todos' || filtroFecha || busqueda) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Filtros activos:</span>
                  {filtroTipo !== 'todos' && (
                    <Badge variant="secondary">
                      Tipo: {filtroTipo === 'entrada' ? 'Entradas' : 'Salidas'}
                    </Badge>
                  )}
                  {filtroFecha && (
                    <Badge variant="secondary">
                      Fecha: {new Date(filtroFecha).toLocaleDateString('es-ES')}
                    </Badge>
                  )}
                  {busqueda && (
                    <Badge variant="secondary">
                      Búsqueda: "{busqueda}"
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFiltroTipo('todos')
                      setFiltroFecha('')
                      setBusqueda('')
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabla de Registros */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registros de Acceso</CardTitle>
                  <CardDescription className="mt-1">
                    {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''} encontrado{registrosFiltrados.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrdenamiento(ordenamiento === 'desc' ? 'asc' : 'desc')}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {ordenamiento === 'desc' ? 'Más recientes' : 'Más antiguos'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Cargando registros...</p>
                </div>
              ) : registrosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay registros de acceso</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(filtroTipo !== 'todos' || filtroFecha || busqueda) 
                      ? 'Intenta ajustar los filtros' 
                      : 'Los accesos aparecerán aquí'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Residente</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead className="w-[120px]">Tipo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosFiltrados.map((registro) => {
                        const { fecha, hora } = formatFechaHora(registro.fecha_hora)
                        return (
                          <TableRow key={registro.id}>
                            <TableCell className="font-medium">#{registro.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {registro.usuario_nombre} {registro.usuario_apellido}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {registro.departamento_numero || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {registro.tipo === 'entrada' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20">
                                  <LogIn className="h-3 w-3 mr-1" />
                                  Entrada
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20">
                                  <LogOut className="h-3 w-3 mr-1" />
                                  Salida
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {fecha}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {hora}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  )
}
