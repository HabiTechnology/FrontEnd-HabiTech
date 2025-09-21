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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Building, UserCheck, UserX, Phone, Loader2, Search, Filter, Users, Eye, Trash2, User } from 'lucide-react'

interface ResidenteData {
  id: number
  usuario_id: number
  departamento_id: number
  tipo_relacion: string
  fecha_ingreso: string
  fecha_salida: string | null
  es_principal: boolean
  activo: boolean
  nombre_contacto_emergencia: string | null
  telefono_contacto_emergencia: string | null
  creado_en: string
}

interface ResidenteDetallado {
  id: number
  usuario_id: number
  departamento_id: number
  tipo_relacion: string
  fecha_ingreso: string
  fecha_salida: string | null
  es_principal: boolean
  activo: boolean
  nombre_contacto_emergencia: string | null
  telefono_contacto_emergencia: string | null
  creado_en: string
  actualizado_en: string | null
}

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

export default function ResidentesTable() {
  const [residentes, setResidentes] = useState<ResidenteData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [selectedResidente, setSelectedResidente] = useState<ResidenteData | null>(null)
  const [residenteDetallado, setResidenteDetallado] = useState<ResidenteDetallado | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

  const eliminarResidente = async (residenteId: number) => {
    try {
      const response = await fetch(`/api/residentes/${residenteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      // Actualizar la lista después de eliminar
      await fetchResidentes()
      alert('Residente eliminado exitosamente')
    } catch (err) {
      console.error('Error eliminando residente:', err)
      alert('Error eliminando residente: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    }
  }

  const verDetalles = async (residente: ResidenteData) => {
    try {
      setSelectedResidente(residente)
      setShowDetailsModal(true)
      setResidenteDetallado(null) // Limpiar datos anteriores
      
      console.log('🔍 Obteniendo detalles para residente:', residente.id)
      
      // Obtener información detallada solo de residentes
      const response = await fetch(`/api/residentes/detalles/${residente.id}`)
      if (response.ok) {
        const detalles = await response.json()
        console.log('✅ Detalles obtenidos:', detalles)
        setResidenteDetallado({...detalles, actualizado_en: detalles.actualizado_en || null})
      } else {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        // Si falla, usar los datos básicos que ya tenemos
        setResidenteDetallado({...residente, actualizado_en: null})
      }
    } catch (error) {
      console.error('❌ Error de red:', error)
      // Mantener el modal abierto con información básica
      setResidenteDetallado({...residente, actualizado_en: null})
    }
  }

  const cerrarModal = () => {
    setShowDetailsModal(false)
    setSelectedResidente(null)
    setResidenteDetallado(null)
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
                  <TableHead>Contacto Emergencia</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-32">Acciones</TableHead>
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verDetalles(residente)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar residente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el residente 
                                con ID {residente.id} del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => eliminarResidente(residente.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Modal de Detalles */}
      <Dialog open={showDetailsModal} onOpenChange={cerrarModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalles del Residente
            </DialogTitle>
            <DialogDescription>
              Información detallada del residente
            </DialogDescription>
          </DialogHeader>
          
          {residenteDetallado ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1: Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-2 border-b pb-2">
                  <User className="h-5 w-5 text-[#007BFF]" />
                  Información Básica
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#F5F7FA] dark:bg-[#1A2E49] rounded-lg border">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">ID Residente</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-semibold">{residenteDetallado.id}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">ID Usuario</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-semibold">{residenteDetallado.usuario_id}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">ID Departamento</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-semibold">{residenteDetallado.departamento_id}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Tipo de Relación</label>
                        <div className="mt-1">
                          <Badge variant={residenteDetallado.tipo_relacion === 'propietario' ? 'default' : 'secondary'} className="text-xs capitalize">
                            {residenteDetallado.tipo_relacion}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Residente Principal</label>
                        <div className="mt-1">
                          <Badge variant={residenteDetallado.es_principal ? 'default' : 'outline'} className="text-xs">
                            {residenteDetallado.es_principal ? '✅ Sí' : '❌ No'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Estado</label>
                        <div className="mt-1">
                          <Badge variant={residenteDetallado.activo ? 'default' : 'destructive'} className="text-xs flex items-center gap-1 w-fit">
                            {residenteDetallado.activo ? (
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 2: Fechas y Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-2 border-b pb-2">
                  <Phone className="h-5 w-5 text-[#007BFF]" />
                  Fechas y Contacto
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#F5F7FA] dark:bg-[#1A2E49] rounded-lg border">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Fecha de Ingreso</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF]">{formatDate(residenteDetallado.fecha_ingreso)}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Fecha de Salida</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF]">
                          {residenteDetallado.fecha_salida ? formatDate(residenteDetallado.fecha_salida) : 'Aún reside aquí'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Contacto de Emergencia</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF]">
                          {residenteDetallado.nombre_contacto_emergencia || 'No especificado'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Teléfono de Emergencia</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] flex items-center gap-2">
                          {residenteDetallado.telefono_contacto_emergencia ? (
                            <>
                              <Phone className="h-4 w-4 text-[#007BFF]" />
                              {residenteDetallado.telefono_contacto_emergencia}
                            </>
                          ) : (
                            'No especificado'
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-[#A0AAB4]">Creado en</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] text-xs">
                          {formatDate(residenteDetallado.creado_en)}
                        </p>
                      </div>
                      
                      {residenteDetallado.actualizado_en && (
                        <div>
                          <label className="text-xs font-medium text-[#A0AAB4]">Actualizado en</label>
                          <p className="text-[#1A2E49] dark:text-[#FFFFFF] text-xs">
                            {formatDate(residenteDetallado.actualizado_en)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedResidente ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-[#A0AAB4]">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando información detallada...
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  </div>
  )
}
