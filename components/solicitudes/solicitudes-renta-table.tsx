'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Eye, Check, X, Clock, Loader2, User, Home, Phone, Mail, DollarSign, Users, Heart, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { SolicitudRenta } from '@/types/solicitud-renta'

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  en_revision: 'bg-blue-100 text-blue-800 border-blue-200',
  aprobada: 'bg-green-100 text-green-800 border-green-200',
  rechazada: 'bg-red-100 text-red-800 border-red-200'
}

const estadoIcons = {
  pendiente: Clock,
  en_revision: AlertCircle,
  aprobada: CheckCircle2,
  rechazada: XCircle
}

interface SolicitudRentaExtendida extends SolicitudRenta {
  departamento?: {
    numero: string
    piso: number
    dormitorios: number
    banos: number
    renta_mensual: number
  }
}

// Función para formatear fechas
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function SolicitudesRentaTable() {
  const [solicitudes, setSolicitudes] = useState<SolicitudRentaExtendida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudRentaExtendida | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [filterEstado, setFilterEstado] = useState<string>('all')

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      const url = filterEstado !== 'all' 
        ? `/api/solicitudes-renta?estado=${filterEstado}&limit=50`
        : '/api/solicitudes-renta?limit=50'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSolicitudes(data.solicitudes || [])
      } else {
        setError('Error al cargar las solicitudes')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [filterEstado])

  const actualizarEstado = async (id: number, nuevoEstado: string, observaciones?: string) => {
    try {
      setUpdatingStatus(id)
      const response = await fetch(`/api/solicitudes-renta/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          estado: nuevoEstado,
          observaciones: observaciones || ''
        })
      })

      if (response.ok) {
        await cargarSolicitudes() // Recargar la lista
        setSelectedSolicitud(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar el estado')
      }
    } catch (error) {
      setError('Error de conexión al actualizar')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && solicitudes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header y filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Renta</h2>
          <p className="text-gray-600">Gestiona las solicitudes de arriendo recibidas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="en_revision">En Revisión</SelectItem>
              <SelectItem value="aprobada">Aprobadas</SelectItem>
              <SelectItem value="rechazada">Rechazadas</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={cargarSolicitudes}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(estadoColors).map(([estado, colorClass]) => {
          const count = solicitudes.filter(s => s.estado === estado).length
          const Icon = estadoIcons[estado as keyof typeof estadoIcons]
          
          return (
            <Card key={estado} className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">
                    {estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabla de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Recibidas</CardTitle>
          <CardDescription>
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} encontrada{solicitudes.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {solicitudes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay solicitudes que mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((solicitud) => {
                    const EstadoIcon = estadoIcons[solicitud.estado as keyof typeof estadoIcons]
                    
                    return (
                      <TableRow key={solicitud.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{solicitud.nombre_solicitante}</div>
                            <div className="text-sm text-gray-500">
                              Doc: {solicitud.documento_solicitante}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {solicitud.departamento ? (
                            <div className="space-y-1">
                              <div className="font-medium">
                                Depto {solicitud.departamento.numero}
                              </div>
                              <div className="text-sm text-gray-500">
                                Piso {solicitud.departamento.piso} • {solicitud.departamento.dormitorios} hab
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {formatCurrency(solicitud.departamento.renta_mensual)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Departamento no encontrado</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{solicitud.correo_solicitante}</div>
                            <div className="text-sm text-gray-500">{solicitud.telefono_solicitante}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatCurrency(solicitud.ingreso_mensual)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {solicitud.ocupacion}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={estadoColors[solicitud.estado as keyof typeof estadoColors]}
                          >
                            <EstadoIcon className="h-3 w-3 mr-1" />
                            {solicitud.estado.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(solicitud.fecha_solicitud)}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSolicitud(solicitud)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                {selectedSolicitud && (
                                  <SolicitudDetail 
                                    solicitud={selectedSolicitud}
                                    onUpdateStatus={actualizarEstado}
                                    isUpdating={updatingStatus === selectedSolicitud.id}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {solicitud.estado === 'pendiente' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => actualizarEstado(solicitud.id, 'en_revision')}
                                  disabled={updatingStatus === solicitud.id}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => actualizarEstado(solicitud.id, 'aprobada')}
                                  disabled={updatingStatus === solicitud.id}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => actualizarEstado(solicitud.id, 'rechazada')}
                                  disabled={updatingStatus === solicitud.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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
  )
}

// Componente de detalle de solicitud
function SolicitudDetail({ 
  solicitud, 
  onUpdateStatus, 
  isUpdating 
}: { 
  solicitud: SolicitudRentaExtendida
  onUpdateStatus: (id: number, estado: string, observaciones?: string) => void
  isUpdating: boolean
}) {
  const [newStatus, setNewStatus] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const handleStatusUpdate = () => {
    if (newStatus) {
      onUpdateStatus(solicitud.id, newStatus, observaciones)
      setNewStatus('')
      setObservaciones('')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Solicitud de {solicitud.nombre_solicitante}
        </DialogTitle>
        <DialogDescription>
          Enviada el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CO')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Nombre</Label>
                <p className="font-medium">{solicitud.nombre_solicitante}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Documento</Label>
                <p className="font-medium">{solicitud.documento_solicitante}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Email</Label>
                <p className="font-medium">{solicitud.correo_solicitante}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Teléfono</Label>
                <p className="font-medium">{solicitud.telefono_solicitante}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Departamento Solicitado</CardTitle>
          </CardHeader>
          <CardContent>
            {solicitud.departamento ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número:</span>
                  <span className="font-medium">{solicitud.departamento.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Piso:</span>
                  <span className="font-medium">{solicitud.departamento.piso}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dormitorios:</span>
                  <span className="font-medium">{solicitud.departamento.dormitorios}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Baños:</span>
                  <span className="font-medium">{solicitud.departamento.banos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Renta:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(solicitud.departamento.renta_mensual)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Información del departamento no disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Información Económica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Económica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ocupación:</span>
              <span className="font-medium">{solicitud.ocupacion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ingresos Mensuales:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(solicitud.ingreso_mensual)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tamaño Familia:</span>
              <span className="font-medium">{solicitud.tamano_familia} persona{solicitud.tamano_familia !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mascotas:</span>
              <span className="font-medium">{solicitud.mascotas ? 'Sí' : 'No'}</span>
            </div>
            {solicitud.mascotas && solicitud.detalles_mascotas && (
              <div>
                <Label className="text-sm text-gray-600">Detalles de Mascotas:</Label>
                <p className="text-sm mt-1">{solicitud.detalles_mascotas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referencias y Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referencias y Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Referencias */}
            {solicitud.referencias && (
              <div>
                <Label className="text-sm text-gray-600">Referencias</Label>
                <div className="mt-2 space-y-2">
                  {solicitud.referencias.personal?.map((ref, idx) => (
                    <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                      <strong>Personal:</strong> {ref.nombre} ({ref.relacion}) - {ref.telefono}
                    </div>
                  ))}
                  {solicitud.referencias.laboral?.map((ref, idx) => (
                    <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                      <strong>Laboral:</strong> {ref.nombre_contacto} en {ref.empresa} - {ref.telefono}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentos */}
            {solicitud.documentos && (
              <div>
                <Label className="text-sm text-gray-600">Documentos Disponibles</Label>
                <div className="mt-2 space-y-1">
                  {solicitud.documentos.cedula && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Cédula de Ciudadanía
                    </div>
                  )}
                  {solicitud.documentos.comprobante_ingresos && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Comprobante de Ingresos
                    </div>
                  )}
                  {solicitud.documentos.referencias_laborales && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Referencias Laborales
                    </div>
                  )}
                  {solicitud.documentos.referencias_personales && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Referencias Personales
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mensaje adicional */}
      {solicitud.mensaje && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Mensaje del Solicitante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{solicitud.mensaje}</p>
          </CardContent>
        </Card>
      )}

      {/* Observaciones actuales */}
      {solicitud.observaciones && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Observaciones Actuales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{solicitud.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Actualizar Estado */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Actualizar Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observaciones</Label>
            <Textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agregar observaciones sobre la decisión..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleStatusUpdate}
            disabled={!newStatus || isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar Estado'
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}