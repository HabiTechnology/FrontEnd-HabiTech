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
import { Building, UserCheck, UserX, Phone, Loader2, Search, Filter, Users, Eye, Trash2, User, FileText, Download } from 'lucide-react'
import { generarPDFTablaCompleta, generarPDFResidenteIndividual } from '@/lib/pdf-utils'

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

      const response = await fetch('/api/residentes')
      if (response.ok) {
        const data = await response.json()

        setResidentes(data)
        setError(null)
      } else {

        setError('Error al cargar residentes')
      }
    } catch (error) {

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
        // Actualizar la lista local removiendo el residente eliminado
        setResidentes(prev => prev.filter(r => r.id !== residente.id))
        setShowDeleteModal(false)
        setSelectedResidente(null)
        
        // Mostrar mensaje de éxito
        alert('Residente eliminado exitosamente')
      } else {
        const errorData = await response.json()

        alert(errorData.error || 'Error al eliminar el residente')
      }
    } catch (error) {

      alert('Error de conexión. Por favor, intenta de nuevo.')
    }
  }

  const verDetalles = async (residente: ResidenteData) => {
    try {
      setSelectedResidente(residente)
      setShowDetailsModal(true)
      setResidenteDetallado(null)
      

      
      // Obtener información detallada solo de residentes
      const response = await fetch(`/api/residentes/detalles/${residente.id}`)
      if (response.ok) {
        const detalles = await response.json()

        setResidenteDetallado(detalles)
      } else {
        const errorData = await response.json()

        // Si falla, usar los datos básicos que ya tenemos
        setResidenteDetallado({
          ...residente,
          actualizado_en: null
        })
      }
    } catch (error) {

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
          
          {/* Botón Exportar PDF */}
          <Button
            onClick={async () => await generarPDFTablaCompleta(residentesFiltrados)}
            variant="outline"
            className="flex items-center gap-2 bg-[#007BFF] text-white hover:bg-[#0056b3] border-[#007BFF]"
            title={`Exportar ${residentesFiltrados.length} residente(s) a PDF`}
          >
            <FileText className="h-4 w-4" />
            Exportar PDF ({residentesFiltrados.length})
          </Button>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => await generarPDFResidenteIndividual(residente)}
                          className="flex items-center gap-1 text-[#007BFF] hover:text-[#0056b3] hover:bg-[#007BFF]/10"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                        <AlertDialog open={showDeleteModal && selectedResidente?.id === residente.id} onOpenChange={setShowDeleteModal}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedResidente(residente)
                                setShowDeleteModal(true)
                              }}
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
        <DialogContent className="max-w-[99vw] w-[99vw] min-w-[1400px] h-[95vh] overflow-y-auto p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-4">
                  <div className="bg-gradient-to-r from-[#007BFF] to-[#1A2E49] p-4 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  Información Completa del Residente
                </DialogTitle>
                <DialogDescription className="text-lg text-[#A0AAB4] mt-3">
                  Datos completos del usuario, departamento y residencia en el sistema HabiTech
                </DialogDescription>
              </div>
              
              {/* Botón PDF en el Modal */}
              {selectedResidente && residenteDetallado && (
                <Button
                  onClick={async () => await generarPDFResidenteIndividual({
                    ...selectedResidente,
                    ...residenteDetallado
                  })}
                  variant="outline"
                  className="flex items-center gap-2 bg-[#007BFF] text-white hover:bg-[#0056b3] border-[#007BFF] px-6 py-3"
                >
                  <FileText className="h-5 w-5" />
                  Generar PDF Detallado
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {residenteDetallado && selectedResidente ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
              
              {/* Columna 1: Información del Usuario */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#007BFF]/10 to-[#1A2E49]/5 rounded-2xl p-8 border border-[#007BFF]/20">
                  <h3 className="text-2xl font-bold text-[#1A2E49] dark:text-[#F5F7FA] flex items-center gap-4 mb-6">
                    <div className="bg-[#007BFF] p-3 rounded-xl">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    Datos del Usuario
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#1A2E49] rounded-xl shadow-sm">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#007BFF] to-[#1A2E49] rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {selectedResidente.usuario?.nombre?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-xl text-[#1A2E49] dark:text-white">
                          {selectedResidente.usuario?.nombre && selectedResidente.usuario?.apellido 
                            ? `${selectedResidente.usuario.nombre} ${selectedResidente.usuario.apellido}`
                            : 'Usuario no disponible'
                          }
                        </p>
                        <p className="text-sm text-[#A0AAB4] mt-1">ID: {selectedResidente.usuario_id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-white dark:bg-[#1A2E49] rounded-xl shadow-sm">
                        <label className="text-xs font-medium text-[#A0AAB4] uppercase tracking-wide">Correo Electrónico</label>
                        <p className="text-[#1A2E49] dark:text-white font-medium mt-2 flex items-center gap-3 text-lg">
                          <span>📧</span>
                          {selectedResidente.usuario?.correo || 'No disponible'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-[#1A2E49] rounded-xl shadow-sm">
                        <label className="text-xs font-medium text-[#A0AAB4] uppercase tracking-wide">Documento</label>
                        <p className="text-[#1A2E49] dark:text-white font-medium mt-2 flex items-center gap-3 text-lg">
                          <span>🆔</span>
                          {selectedResidente.usuario?.numero_documento || 'No disponible'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-[#1A2E49] rounded-xl shadow-sm">
                        <label className="text-xs font-medium text-[#A0AAB4] uppercase tracking-wide">Teléfono</label>
                        <p className="text-[#1A2E49] dark:text-white font-medium mt-2 flex items-center gap-3 text-lg">
                          <Phone className="h-5 w-5 text-[#007BFF]" />
                          {selectedResidente.usuario?.telefono || 'No disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contacto de Emergencia */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-200 flex items-center gap-4 mb-6">
                    <div className="bg-red-500 p-3 rounded-xl">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    Contacto de Emergencia
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-red-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-red-600 dark:text-red-300 uppercase tracking-wide">Nombre</label>
                      <p className="text-red-800 dark:text-red-100 font-medium mt-2 text-lg">
                        {residenteDetallado.nombre_contacto_emergencia || '❌ No especificado'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-red-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-red-600 dark:text-red-300 uppercase tracking-wide">Teléfono</label>
                      <p className="text-red-800 dark:text-red-100 font-medium mt-2 text-lg">
                        {residenteDetallado.telefono_contacto_emergencia || '❌ No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 2: Información del Departamento */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 flex items-center gap-4 mb-6">
                    <div className="bg-green-500 p-3 rounded-xl">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    Información del Departamento
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-6 bg-white dark:bg-green-900/30 rounded-xl shadow-sm">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                        {selectedResidente.departamento?.numero || selectedResidente.departamento_id}
                      </div>
                      <div>
                        <p className="font-bold text-2xl text-green-800 dark:text-green-100">
                          Departamento {selectedResidente.departamento?.numero || selectedResidente.departamento_id}
                        </p>
                        <p className="text-green-600 dark:text-green-300 text-lg mt-1">
                          Piso {selectedResidente.departamento?.piso || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-white dark:bg-green-900/30 rounded-xl text-center shadow-sm">
                        <div className="text-3xl font-bold text-green-800 dark:text-green-100 mb-2">
                          {selectedResidente.departamento?.dormitorios || '?'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300 font-medium uppercase">Dormitorios</div>
                      </div>
                      
                      <div className="p-6 bg-white dark:bg-green-900/30 rounded-xl text-center shadow-sm">
                        <div className="text-3xl font-bold text-green-800 dark:text-green-100 mb-2">
                          {selectedResidente.departamento?.banos || '?'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300 font-medium uppercase">Baños</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-green-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-green-600 dark:text-green-300 uppercase tracking-wide">Área</label>
                      <p className="text-green-800 dark:text-green-100 font-bold text-2xl mt-2">
                        {selectedResidente.departamento?.area_m2 ? `${selectedResidente.departamento.area_m2} m²` : 'No disponible'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-green-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-green-600 dark:text-green-300 uppercase tracking-wide">Renta Mensual</label>
                      <p className="text-green-800 dark:text-green-100 font-bold text-2xl mt-2">
                        {selectedResidente.departamento?.renta_mensual ? `$${selectedResidente.departamento.renta_mensual}` : 'No disponible'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-green-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-green-600 dark:text-green-300 uppercase tracking-wide">Estado</label>
                      <div className="mt-3">
                        <Badge 
                          variant={selectedResidente.departamento?.estado === 'disponible' ? 'default' : 'secondary'}
                          className="bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-100 text-lg px-4 py-2"
                        >
                          {selectedResidente.departamento?.estado || 'Desconocido'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 3: Información de Residencia */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-4 mb-6">
                    <div className="bg-purple-500 p-3 rounded-xl">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    Datos de Residencia
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-purple-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">ID Residente</label>
                      <p className="text-purple-800 dark:text-purple-100 font-bold text-3xl mt-2">#{residenteDetallado.id}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-white dark:bg-purple-900/30 rounded-xl shadow-sm">
                        <label className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">Tipo de Relación</label>
                        <div className="mt-3">
                          <Badge 
                            variant={residenteDetallado.tipo_relacion === 'propietario' ? 'default' : 'secondary'}
                            className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-800 dark:text-purple-100 text-lg px-4 py-2"
                          >
                            {residenteDetallado.tipo_relacion.charAt(0).toUpperCase() + residenteDetallado.tipo_relacion.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-purple-900/30 rounded-xl shadow-sm">
                        <label className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">Residente Principal</label>
                        <div className="mt-3">
                          <Badge 
                            variant={residenteDetallado.es_principal ? 'default' : 'outline'}
                            className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-800 dark:text-purple-100 text-lg px-4 py-2"
                          >
                            {residenteDetallado.es_principal ? '✅ Principal' : '👥 Secundario'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-purple-900/30 rounded-xl shadow-sm">
                        <label className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">Estado</label>
                        <div className="mt-3">
                          <Badge 
                            variant={residenteDetallado.activo ? 'default' : 'destructive'}
                            className="text-lg px-4 py-2 flex items-center gap-3 w-fit"
                          >
                            {residenteDetallado.activo ? (
                              <>
                                <UserCheck className="h-5 w-5" />
                                Activo
                              </>
                            ) : (
                              <>
                                <UserX className="h-5 w-5" />
                                Inactivo
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fechas Importantes */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-4 mb-6">
                    <div className="bg-amber-500 p-3 rounded-xl">
                      📅
                    </div>
                    Fechas Importantes
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-amber-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-amber-600 dark:text-amber-300 uppercase tracking-wide">Fecha de Ingreso</label>
                      <p className="text-amber-800 dark:text-amber-100 font-bold text-xl mt-2">
                        {formatDate(residenteDetallado.fecha_ingreso)}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-amber-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-amber-600 dark:text-amber-300 uppercase tracking-wide">Fecha de Salida</label>
                      <p className="text-amber-800 dark:text-amber-100 font-medium mt-2 text-lg">
                        {residenteDetallado.fecha_salida ? formatDate(residenteDetallado.fecha_salida) : '🏠 Aún reside aquí'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white dark:bg-amber-900/30 rounded-xl shadow-sm">
                      <label className="text-xs font-medium text-amber-600 dark:text-amber-300 uppercase tracking-wide">Días de Residencia</label>
                      <p className="text-amber-800 dark:text-amber-100 font-bold text-2xl mt-2">
                        {Math.floor((new Date().getTime() - new Date(residenteDetallado.fecha_ingreso).getTime()) / (1000 * 3600 * 24))} días
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Resumen Rápido */}
                <div className="bg-gradient-to-br from-[#007BFF]/10 to-[#1A2E49]/10 rounded-2xl p-6 border border-[#007BFF]/20">
                  <h4 className="font-bold text-[#1A2E49] dark:text-[#F5F7FA] mb-4 flex items-center gap-3 text-lg">
                    📊 Resumen Rápido
                  </h4>
                  <div className="text-base text-[#A0AAB4] space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-[#007BFF] rounded-full"></span>
                      <span>Residente {residenteDetallado.tipo_relacion} {residenteDetallado.es_principal ? '(Principal)' : '(Secundario)'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Estado: {residenteDetallado.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      <span>Departamento: {selectedResidente.departamento?.numero || selectedResidente.departamento_id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#007BFF]" />
                <span className="text-xl text-[#A0AAB4]">Cargando información...</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
