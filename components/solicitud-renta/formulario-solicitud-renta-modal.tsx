'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Home, User, Briefcase, Heart, FileText, Send, Plus, Trash2 } from 'lucide-react'
import { SolicitudRentaForm, Referencias, Documentos } from '@/types/solicitud-renta'

interface Departamento {
  id: number
  numero: string
  piso: number
  dormitorios: number
  banos: number
  area_m2: number
  renta_mensual: number
  mantenimiento_mensual: number
  estado: string
  descripcion?: string
}

interface FormularioSolicitudRentaModalProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function FormularioSolicitudRentaModal({ 
  onSuccess, 
  onCancel 
}: FormularioSolicitudRentaModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true)
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<SolicitudRentaForm>({
    departamento_id: 0,
    nombre_solicitante: '',
    correo_solicitante: '',
    telefono_solicitante: '',
    documento_solicitante: '',
    ingreso_mensual: 0,
    ocupacion: '',
    tamano_familia: 1,
    mascotas: false,
    detalles_mascotas: '',
    referencias: {
      personal: [],
      laboral: []
    },
    documentos: {
      cedula: false,
      comprobante_ingresos: false,
      referencias_laborales: false,
      referencias_personales: false,
      otros: []
    },
    mensaje: ''
  })

  // Cargar departamentos disponibles
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        const response = await fetch('/api/departamentos?estado=disponible')
        if (response.ok) {
          const data = await response.json()
          setDepartamentos(data.departamentos || [])
        } else {
          setError('Error al cargar departamentos disponibles')
        }
      } catch (error) {
        setError('Error de conexión al cargar departamentos')
      } finally {
        setLoadingDepartamentos(false)
      }
    }

    cargarDepartamentos()
  }, [])

  const handleInputChange = (field: keyof SolicitudRentaForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDocumentosChange = (campo: keyof Documentos, valor: boolean) => {
    const nuevosDocumentos = { ...formData.documentos }
    ;(nuevosDocumentos as any)[campo] = valor
    handleInputChange('documentos', nuevosDocumentos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validaciones básicas
      if (!formData.departamento_id) {
        throw new Error('Debe seleccionar un departamento')
      }

      if (!formData.nombre_solicitante.trim()) {
        throw new Error('El nombre del solicitante es requerido')
      }

      if (!formData.correo_solicitante.trim()) {
        throw new Error('El correo electrónico es requerido')
      }

      if (!formData.telefono_solicitante.trim()) {
        throw new Error('El teléfono es requerido')
      }

      if (!formData.documento_solicitante.trim()) {
        throw new Error('El documento de identidad es requerido')
      }

      if (formData.ingreso_mensual <= 0) {
        throw new Error('El ingreso mensual debe ser mayor a 0')
      }

      if (!formData.ocupacion.trim()) {
        throw new Error('La ocupación es requerida')
      }

      const response = await fetch('/api/solicitudes-renta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess('¡Solicitud enviada exitosamente! Nos pondremos en contacto contigo pronto.')
        
        // Llamar callback de éxito después de 2 segundos
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al enviar la solicitud')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const departamentoSeleccionado = departamentos.find(d => d.id === formData.departamento_id)

  if (loadingDepartamentos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando departamentos disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Seleccionar Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Label htmlFor="departamento">Departamento Disponible *</Label>
              <Select
                value={formData.departamento_id.toString()}
                onValueChange={(value) => handleInputChange('departamento_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento..." />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          Depto {dept.numero} - Piso {dept.piso}
                        </span>
                        <span className="text-sm text-gray-500 ml-4">
                          {dept.dormitorios} hab, {dept.banos} baños - ${dept.renta_mensual.toLocaleString()}/mes
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {departamentoSeleccionado && (
                <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-2">Detalles del Departamento</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dormitorios:</span>
                      <p className="font-medium">{departamentoSeleccionado.dormitorios}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Baños:</span>
                      <p className="font-medium">{departamentoSeleccionado.banos}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Área:</span>
                      <p className="font-medium">{departamentoSeleccionado.area_m2} m²</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Renta:</span>
                      <p className="font-medium">{formatCurrency(departamentoSeleccionado.renta_mensual)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre_solicitante}
                  onChange={(e) => handleInputChange('nombre_solicitante', e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div>
                <Label htmlFor="documento">Documento de Identidad *</Label>
                <Input
                  id="documento"
                  value={formData.documento_solicitante}
                  onChange={(e) => handleInputChange('documento_solicitante', e.target.value)}
                  placeholder="12345678"
                  required
                />
              </div>
              <div>
                <Label htmlFor="correo">Correo Electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo_solicitante}
                  onChange={(e) => handleInputChange('correo_solicitante', e.target.value)}
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono_solicitante}
                  onChange={(e) => handleInputChange('telefono_solicitante', e.target.value)}
                  placeholder="300 123 4567"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral y Económica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Información Laboral y Económica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ocupacion">Ocupación *</Label>
                <Input
                  id="ocupacion"
                  value={formData.ocupacion}
                  onChange={(e) => handleInputChange('ocupacion', e.target.value)}
                  placeholder="Ingeniero de Software"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ingresos">Ingresos Mensuales *</Label>
                <Input
                  id="ingresos"
                  type="number"
                  value={formData.ingreso_mensual || ''}
                  onChange={(e) => handleInputChange('ingreso_mensual', parseFloat(e.target.value) || 0)}
                  placeholder="5000000"
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="familia">Tamaño de la Familia *</Label>
                <Select
                  value={formData.tamano_familia.toString()}
                  onValueChange={(value) => handleInputChange('tamano_familia', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mascotas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mascotas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mascotas"
                checked={formData.mascotas}
                onCheckedChange={(checked) => handleInputChange('mascotas', checked)}
              />
              <Label htmlFor="mascotas">Tengo mascotas</Label>
            </div>

            {formData.mascotas && (
              <div>
                <Label htmlFor="detalles_mascotas">Detalles de las Mascotas</Label>
                <Textarea
                  id="detalles_mascotas"
                  value={formData.detalles_mascotas || ''}
                  onChange={(e) => handleInputChange('detalles_mascotas', e.target.value)}
                  placeholder="Describe tus mascotas: tipo, raza, edad, etc."
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cedula"
                  checked={formData.documentos?.cedula || false}
                  onCheckedChange={(checked) => handleDocumentosChange('cedula', !!checked)}
                />
                <Label htmlFor="cedula">Cédula de Ciudadanía</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comprobante_ingresos"
                  checked={formData.documentos?.comprobante_ingresos || false}
                  onCheckedChange={(checked) => handleDocumentosChange('comprobante_ingresos', !!checked)}
                />
                <Label htmlFor="comprobante_ingresos">Comprobante de Ingresos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="referencias_laborales"
                  checked={formData.documentos?.referencias_laborales || false}
                  onCheckedChange={(checked) => handleDocumentosChange('referencias_laborales', !!checked)}
                />
                <Label htmlFor="referencias_laborales">Referencias Laborales</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="referencias_personales"
                  checked={formData.documentos?.referencias_personales || false}
                  onCheckedChange={(checked) => handleDocumentosChange('referencias_personales', !!checked)}
                />
                <Label htmlFor="referencias_personales">Referencias Personales</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Mensaje Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.mensaje || ''}
              onChange={(e) => handleInputChange('mensaje', e.target.value)}
              placeholder="Cuéntanos algo más sobre ti o tu situación..."
              className="resize-none"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-8"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}