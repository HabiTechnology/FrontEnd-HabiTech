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
  // Datos del usuario relacionado
  usuario?: {
    nombre: string
    apellido: string
    correo: string
    telefono: string | null
    numero_documento: string
    imagen_perfil: string | null
  }
  // Datos del departamento relacionado
  departamento?: {
    numero: string
    piso: number
    dormitorios: number
    banos: number
    area_m2: number | null
    renta_mensual: number
    estado: string
  }
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

export default function ResidentesTableSimple() {
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
      console.log('🔍 Obteniendo residentes...')
      const response = await fetch('/api/residentes')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Datos recibidos:', data)
        console.log('🔎 Primer residente:', data[0])
        setResidentes(data)
        setError(null)
      } else {
        console.error('❌ Error en respuesta:', response.status)
        setError('Error al cargar residentes')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  const eliminarResidente = async (residente: ResidenteData) => {
    try {
      const response = await fetch(`/api/residentes/${residente.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setResidentes(prev => prev.filter(r => r.id !== residente.id))
        setShowDeleteModal(false)
        setSelectedResidente(null)
      } else {
        console.error('Error eliminando residente')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const verDetalles = async (residente: ResidenteData) => {
    try {
      setSelectedResidente(residente)
      setShowDetailsModal(true)
      setResidenteDetallado(null)
      
      console.log('🔍 Obteniendo detalles para residente:', residente.id)
      
      // Obtener información detallada solo de residentes
      const response = await fetch(`/api/residentes/detalles/${residente.id}`)
      if (response.ok) {
        const detalles = await response.json()
        console.log('✅ Detalles obtenidos:', detalles)
        setResidenteDetallado(detalles)
      } else {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        // Si falla, usar los datos básicos que ya tenemos
        setResidenteDetallado({
          ...residente,
          actualizado_en: null
        })
      }
    } catch (error) {
      console.error('Error:', error)
      // Si falla, usar los datos básicos que ya tenemos
      setResidenteDetallado({
        ...residente,
        actualizado_en: null
      })
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
      residente.id.toString().includes(busqueda.toLowerCase()) ||
      residente.usuario_id.toString().includes(busqueda.toLowerCase()) ||
      residente.departamento_id.toString().includes(busqueda.toLowerCase()) ||
      residente.tipo_relacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (residente.nombre_contacto_emergencia && residente.nombre_contacto_emergencia.toLowerCase().includes(busqueda.toLowerCase())) ||
      // Buscar en datos del usuario
      (residente.usuario?.nombre && residente.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (residente.usuario?.apellido && residente.usuario.apellido.toLowerCase().includes(busqueda.toLowerCase())) ||
      (residente.usuario?.correo && residente.usuario.correo.toLowerCase().includes(busqueda.toLowerCase())) ||
      (residente.usuario?.numero_documento && residente.usuario.numero_documento.toLowerCase().includes(busqueda.toLowerCase())) ||
      // Buscar en datos del departamento
      (residente.departamento?.numero && residente.departamento.numero.toLowerCase().includes(busqueda.toLowerCase()))

    // Filtro por estado
    const coincideEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && residente.activo) ||
      (filtroEstado === 'inactivos' && !residente.activo)

    return coincideBusqueda && coincideEstado
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando residentes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchResidentes} className="mt-2">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="relative z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lista de Residentes
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 pb-16">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-[#A0AAB4]" />
            <Input
              placeholder="Buscar por ID, nombre, documento, departamento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#A0AAB4]" />
            <Select value={filtroEstado} onValueChange={(value: FiltroEstado) => setFiltroEstado(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activos">Activos</SelectItem>
                <SelectItem value="inactivos">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-12">
        {residentesFiltrados.length === 0 ? (
          <div className="text-center py-8 text-[#A0AAB4]">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron residentes</p>
            {busqueda && <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Residente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residentesFiltrados.map((residente) => (
                  <TableRow key={residente.id}>
                    <TableCell className="font-semibold">{residente.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {residente.usuario?.nombre && residente.usuario?.apellido 
                            ? `${residente.usuario.nombre} ${residente.usuario.apellido}`
                            : `Usuario ID: ${residente.usuario_id}`
                          }
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {residente.usuario?.correo || 'Sin correo'}
                        </span>
                        {residente.usuario?.telefono && (
                          <span className="text-xs text-muted-foreground">
                            {residente.usuario.telefono}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {residente.usuario?.numero_documento || 'No disponible'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {residente.departamento?.numero 
                            ? `Dept. ${residente.departamento.numero}`
                            : `Dept. ID: ${residente.departamento_id}`
                          }
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {residente.departamento?.piso 
                            ? `Piso ${residente.departamento.piso}`
                            : 'Sin info de piso'
                          }
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {residente.departamento?.dormitorios && residente.departamento?.banos
                            ? `${residente.departamento.dormitorios}D / ${residente.departamento.banos}B`
                            : 'Sin info de habitaciones'
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={residente.tipo_relacion === 'propietario' ? 'default' : 'secondary'}>
                        {residente.tipo_relacion}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={residente.es_principal ? 'default' : 'outline'}>
                        {residente.es_principal ? 'Sí' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={residente.activo ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
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
                    <TableCell>{formatDate(residente.fecha_ingreso)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verDetalles(residente)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver más
                        </Button>
                        <AlertDialog open={showDeleteModal && selectedResidente?.id === residente.id} onOpenChange={setShowDeleteModal}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedResidente(residente)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el residente con ID {residente.id}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => eliminarResidente(residente)} className="bg-red-600 hover:bg-red-700">
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

      {/* Modal de Detalles - Solo Información de Residentes */}
      <Dialog open={showDetailsModal} onOpenChange={cerrarModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#007BFF]" />
              Información Detallada del Residente
            </DialogTitle>
            <DialogDescription>
              Datos completos del residente en el sistema HabiTech
            </DialogDescription>
          </DialogHeader>
          
          {residenteDetallado ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda: Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-2 border-b pb-2">
                  <User className="h-5 w-5 text-[#007BFF]" />
                  Información Básica
                </h3>
                
                <div className="p-4 bg-[#F5F7FA] dark:bg-[#1A2E49] rounded-lg border">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">ID Residente</label>
                      <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-bold text-lg">{residenteDetallado.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Tipo de Relación</label>
                      <div className="mt-1">
                        <Badge 
                          variant={residenteDetallado.tipo_relacion === 'propietario' ? 'default' : 'secondary'} 
                          className="text-sm px-3 py-1"
                        >
                          {residenteDetallado.tipo_relacion.charAt(0).toUpperCase() + residenteDetallado.tipo_relacion.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Residente Principal</label>
                      <div className="mt-1">
                        <Badge 
                          variant={residenteDetallado.es_principal ? 'default' : 'outline'} 
                          className="text-sm px-3 py-1"
                        >
                          {residenteDetallado.es_principal ? '✅ Principal' : '👥 Secundario'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Estado de Residencia</label>
                      <div className="mt-1">
                        <Badge 
                          variant={residenteDetallado.activo ? 'default' : 'destructive'} 
                          className="text-sm px-3 py-1 flex items-center gap-1 w-fit"
                        >
                          {residenteDetallado.activo ? (
                            <>
                              <UserCheck className="h-4 w-4" />
                              Activo
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4" />
                              Inactivo
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Referencias */}
                <h3 className="text-lg font-semibold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-2 border-b pb-2">
                  🔗 Referencias del Sistema
                </h3>
                
                <div className="p-4 bg-[#F5F7FA] dark:bg-[#1A2E49] rounded-lg border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">ID Usuario</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-[#007BFF]" />
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-semibold">{residenteDetallado.usuario_id}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">ID Departamento</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-[#007BFF]" />
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-semibold">{residenteDetallado.departamento_id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Fechas y Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-2 border-b pb-2">
                  📅 Fechas Importantes
                </h3>
                
                <div className="p-4 bg-[#F5F7FA] dark:bg-[#1A2E49] rounded-lg border">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Fecha de Ingreso</label>
                      <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-medium text-lg">
                        {formatDate(residenteDetallado.fecha_ingreso)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Fecha de Salida</label>
                      <p className="text-[#1A2E49] dark:text-[#FFFFFF]">
                        {residenteDetallado.fecha_salida ? formatDate(residenteDetallado.fecha_salida) : '🏠 Aún reside aquí'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Registro en Sistema</label>
                      <p className="text-[#1A2E49] dark:text-[#FFFFFF] text-sm">
                        {formatDate(residenteDetallado.creado_en)}
                      </p>
                    </div>
                    {residenteDetallado.actualizado_en && (
                      <div>
                        <label className="text-sm font-medium text-[#A0AAB4]">Última Actualización</label>
                        <p className="text-[#1A2E49] dark:text-[#FFFFFF] text-sm">
                          {formatDate(residenteDetallado.actualizado_en)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <h3 className="text-lg font-semibold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-2 border-b pb-2">
                  <Phone className="h-5 w-5 text-[#007BFF]" />
                  Contacto de Emergencia
                </h3>
                
                <div className="p-4 bg-[#F5F7FA] dark:bg-[#1A2E49] rounded-lg border">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Nombre del Contacto</label>
                      <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-medium">
                        {residenteDetallado.nombre_contacto_emergencia || '❌ No especificado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#A0AAB4]">Teléfono de Emergencia</label>
                      <div className="flex items-center gap-2">
                        {residenteDetallado.telefono_contacto_emergencia ? (
                          <>
                            <Phone className="h-4 w-4 text-[#007BFF]" />
                            <p className="text-[#1A2E49] dark:text-[#FFFFFF] font-medium">
                              {residenteDetallado.telefono_contacto_emergencia}
                            </p>
                          </>
                        ) : (
                          <p className="text-[#A0AAB4]">❌ No especificado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="p-4 bg-gradient-to-r from-[#007BFF]/10 to-[#1A2E49]/10 rounded-lg border border-[#007BFF]/20">
                  <h4 className="font-semibold text-[#1A2E49] dark:text-[#F5F7FA] mb-2">📊 Resumen</h4>
                  <div className="text-sm text-[#A0AAB4] space-y-1">
                    <p>• Residente {residenteDetallado.tipo_relacion} {residenteDetallado.es_principal ? '(Principal)' : '(Secundario)'}</p>
                    <p>• Estado: {residenteDetallado.activo ? '✅ Activo' : '❌ Inactivo'}</p>
                    <p>• Días desde ingreso: {Math.floor((new Date().getTime() - new Date(residenteDetallado.fecha_ingreso).getTime()) / (1000 * 3600 * 24))}</p>
                    {residenteDetallado.telefono_contacto_emergencia && <p>• ✅ Contacto de emergencia configurado</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedResidente ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-[#A0AAB4]">
                <Loader2 className="h-8 w-8 animate-spin text-[#007BFF]" />
                <p>Cargando información detallada...</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  )
}