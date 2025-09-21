"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Building, UserCheck, UserX, Phone, Loader2, Search, Filter, Users } from 'lucide-react'

interface ResidenteData {
  id: number
  usuario_id: number
  departamento_id: number
  tipo_relacion: string
  fecha_ingreso: string
  fecha_salida: string | null
  nombre_contacto_emergencia: string | null
  telefono_contacto_emergencia: string | null
  es_principal: boolean
  activo: boolean
  creado_en: string
}

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

export default function ResidentesTable() {
  const [residentes, setResidentes] = useState<ResidenteData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')

  useEffect(() => {
    fetchResidentes()
  }, [])

  const fetchResidentes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/residentes')
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setResidentes(data)
    } catch (err) {
      console.error('Error fetching residentes:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filtrar residentes basado en búsqueda y estado
  const residentesFiltrados = residentes.filter(residente => {
    // Filtro por búsqueda
    const coincideBusqueda = busqueda === '' || 
      residente.id.toString().includes(busqueda) ||
      residente.usuario_id.toString().includes(busqueda) ||
      residente.departamento_id.toString().includes(busqueda) ||
      residente.tipo_relacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (residente.nombre_contacto_emergencia || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (residente.telefono_contacto_emergencia || '').includes(busqueda)

    // Filtro por estado
    const coincideEstado = 
      filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && residente.activo) ||
      (filtroEstado === 'inactivos' && !residente.activo)

    return coincideBusqueda && coincideEstado
  })

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Residentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando residentes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <UserX className="h-5 w-5" />
            Error cargando residentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchResidentes} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header con título y contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Tabla de Residentes</h2>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm">
          {residentesFiltrados.length} de {residentes.length}
        </Badge>
      </div>

      {/* Controles de búsqueda y filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por ID, usuario, departamento, tipo, contacto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={filtroEstado} onValueChange={(value: FiltroEstado) => setFiltroEstado(value)}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activos">Solo Activos</SelectItem>
                <SelectItem value="inactivos">Solo Inactivos</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={fetchResidentes}
              className="flex items-center gap-2"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de residentes */}
      <Card>
        <CardContent className="p-0">
        {residentesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              {busqueda || filtroEstado !== 'todos' 
                ? 'No se encontraron residentes con esos criterios' 
                : 'No hay residentes registrados'
              }
            </p>
            {(busqueda || filtroEstado !== 'todos') && (
              <Button 
                variant="outline" 
                onClick={() => { setBusqueda(''); setFiltroEstado('todos') }}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Tipo Relación</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead>Fecha Salida</TableHead>
                  <TableHead>Contacto Emergencia</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residentesFiltrados.map((residente) => (
                  <TableRow key={residente.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{residente.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">ID: {residente.usuario_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>Depto {residente.departamento_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={residente.tipo_relacion === 'propietario' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {residente.tipo_relacion}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(residente.fecha_ingreso)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(residente.fecha_salida)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {residente.nombre_contacto_emergencia || 'N/A'}
                        </span>
                        {residente.telefono_contacto_emergencia && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {residente.telefono_contacto_emergencia}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={residente.es_principal ? 'default' : 'outline'}>
                        {residente.es_principal ? 'Sí' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={residente.activo ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {residente.activo ? (
                          <>
                            <UserCheck className="h-3 w-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(residente.creado_en)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  )
}
