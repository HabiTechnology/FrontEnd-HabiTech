'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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

export default function FormularioSolicitudRenta() {
  const router = useRouter()
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
        setError('Error de conexiÃ³n al cargar departamentos')
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

  const agregarReferenciaPersoanl = () => {
    const nuevasReferencias = { ...formData.referencias }
    if (!nuevasReferencias.personal) nuevasReferencias.personal = []
    nuevasReferencias.personal.push({
      nombre: '',
      telefono: '',
      relacion: ''
    })
    handleInputChange('referencias', nuevasReferencias)
  }

  const eliminarReferenciaPersoanl = (index: number) => {
    const nuevasReferencias = { ...formData.referencias }
    if (nuevasReferencias.personal) {
      nuevasReferencias.personal.splice(index, 1)
      handleInputChange('referencias', nuevasReferencias)
    }
  }

  const actualizarReferenciaPersoanl = (index: number, campo: string, valor: string) => {
    const nuevasReferencias = { ...formData.referencias }
    if (nuevasReferencias.personal && nuevasReferencias.personal[index]) {
      (nuevasReferencias.personal[index] as any)[campo] = valor
      handleInputChange('referencias', nuevasReferencias)
    }
  }

  const agregarReferenciaLaboral = () => {
    const nuevasReferencias = { ...formData.referencias }
    if (!nuevasReferencias.laboral) nuevasReferencias.laboral = []
    nuevasReferencias.laboral.push({
      empresa: '',
      nombre_contacto: '',
      telefono: '',
      cargo: ''
    })
    handleInputChange('referencias', nuevasReferencias)
  }

  const eliminarReferenciaLaboral = (index: number) => {
    const nuevasReferencias = { ...formData.referencias }
    if (nuevasReferencias.laboral) {
      nuevasReferencias.laboral.splice(index, 1)
      handleInputChange('referencias', nuevasReferencias)
    }
  }

  const actualizarReferenciaLaboral = (index: number, campo: string, valor: string) => {
    const nuevasReferencias = { ...formData.referencias }
    if (nuevasReferencias.laboral && nuevasReferencias.laboral[index]) {
      (nuevasReferencias.laboral[index] as any)[campo] = valor
      handleInputChange('referencias', nuevasReferencias)
    }
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
      // Validaciones bÃ¡sicas
      if (!formData.departamento_id) {
        throw new Error('Debe seleccionar un departamento')
      }

      if (!formData.nombre_solicitante.trim()) {
        throw new Error('El nombre del solicitante es requerido')
      }

      if (!formData.correo_solicitante.trim()) {
        throw new Error('El correo electrÃ³nico es requerido')
      }

      if (!formData.telefono_solicitante.trim()) {
        throw new Error('El telÃ©fono es requerido')
      }

      if (!formData.documento_solicitante.trim()) {
        throw new Error('El documento de identidad es requerido')
      }

      if (formData.ingreso_mensual <= 0) {
        throw new Error('El ingreso mensual debe ser mayor a 0')
      }

      if (!formData.ocupacion.trim()) {
        throw new Error('La ocupaciÃ³n es requerida')
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
        setSuccess('Â¡Solicitud enviada exitosamente! Nos pondremos en contacto contigo pronto.')
        
        // Redirigir despuÃ©s de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
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

  const departamentoSeleccionado = departamentos.find(d => d.id === formData.departamento_id)

  if (loadingDepartamentos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando departamentos disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Solicitud de Renta
          </h1>
          <p className="text-lg text-gray-600">
            Completa el formulario para solicitar el arriendo de tu departamento ideal
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SelecciÃ³n de Departamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Seleccionar Departamento
              </CardTitle>
              <CardDescription>
                Elige el departamento que te interesa arrendar
              </CardDescription>
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
                            {dept.dormitorios} hab, {dept.banos} baÃ±os - ${dept.renta_mensual.toLocaleString()}/mes
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
                        <span className="text-gray-600">BaÃ±os:</span>
                        <p className="font-medium">{departamentoSeleccionado.banos}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Ãrea:</span>
                        <p className="font-medium">{departamentoSeleccionado.area_m2} mÂ²</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Renta:</span>
                        <p className="font-medium">${departamentoSeleccionado.renta_mensual.toLocaleString()}</p>
                      </div>
                    </div>
                    {departamentoSeleccionado.descripcion && (
                      <div className="mt-3">
                        <span className="text-gray-600">DescripciÃ³n:</span>
                        <p className="text-sm">{departamentoSeleccionado.descripcion}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* InformaciÃ³n Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                InformaciÃ³n Personal
              </CardTitle>
              <CardDescription>
                Datos bÃ¡sicos del solicitante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre_solicitante}
                    onChange={(e) => handleInputChange('nombre_solicitante', e.target.value)}
                    placeholder="Juan PÃ©rez"
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
                  <Label htmlFor="correo">Correo ElectrÃ³nico *</Label>
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
                  <Label htmlFor="telefono">TelÃ©fono *</Label>
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

          {/* InformaciÃ³n Laboral y EconÃ³mica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                InformaciÃ³n Laboral y EconÃ³mica
              </CardTitle>
              <CardDescription>
                Detalles sobre tu situaciÃ³n laboral e ingresos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ocupacion">OcupaciÃ³n *</Label>
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
                  <Label htmlFor="familia">TamaÃ±o de la Familia *</Label>
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
              <CardDescription>
                InformaciÃ³n sobre mascotas (si las tienes)
              </CardDescription>
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

          {/* Referencias Personales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Referencias Personales
              </CardTitle>
              <CardDescription>
                Personas que pueden dar referencias sobre ti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.referencias?.personal?.map((ref, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Referencia Personal #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarReferenciaPersoanl(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={ref.nombre}
                        onChange={(e) => actualizarReferenciaPersoanl(index, 'nombre', e.target.value)}
                        placeholder="MarÃ­a GarcÃ­a"
                      />
                    </div>
                    <div>
                      <Label>TelÃ©fono</Label>
                      <Input
                        value={ref.telefono}
                        onChange={(e) => actualizarReferenciaPersoanl(index, 'telefono', e.target.value)}
                        placeholder="300 123 4567"
                      />
                    </div>
                    <div>
                      <Label>RelaciÃ³n</Label>
                      <Input
                        value={ref.relacion}
                        onChange={(e) => actualizarReferenciaPersoanl(index, 'relacion', e.target.value)}
                        placeholder="Amiga"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={agregarReferenciaPersoanl}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Referencia Personal
              </Button>
            </CardContent>
          </Card>

          {/* Referencias Laborales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Referencias Laborales
              </CardTitle>
              <CardDescription>
                Contactos laborales que pueden dar referencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.referencias?.laboral?.map((ref, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Referencia Laboral #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarReferenciaLaboral(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Empresa</Label>
                      <Input
                        value={ref.empresa}
                        onChange={(e) => actualizarReferenciaLaboral(index, 'empresa', e.target.value)}
                        placeholder="Tech Company S.A."
                      />
                    </div>
                    <div>
                      <Label>Nombre del Contacto</Label>
                      <Input
                        value={ref.nombre_contacto}
                        onChange={(e) => actualizarReferenciaLaboral(index, 'nombre_contacto', e.target.value)}
                        placeholder="Ana RodrÃ­guez"
                      />
                    </div>
                    <div>
                      <Label>TelÃ©fono</Label>
                      <Input
                        value={ref.telefono}
                        onChange={(e) => actualizarReferenciaLaboral(index, 'telefono', e.target.value)}
                        placeholder="300 123 4567"
                      />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Input
                        value={ref.cargo}
                        onChange={(e) => actualizarReferenciaLaboral(index, 'cargo', e.target.value)}
                        placeholder="Gerente de RRHH"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={agregarReferenciaLaboral}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Referencia Laboral
              </Button>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Disponibles
              </CardTitle>
              <CardDescription>
                Indica quÃ© documentos tienes disponibles para entregar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cedula"
                    checked={formData.documentos?.cedula || false}
                    onCheckedChange={(checked) => handleDocumentosChange('cedula', !!checked)}
                  />
                  <Label htmlFor="cedula">CÃ©dula de CiudadanÃ­a</Label>
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
              <CardDescription>
                InformaciÃ³n adicional que consideres importante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.mensaje || ''}
                onChange={(e) => handleInputChange('mensaje', e.target.value)}
                placeholder="CuÃ©ntanos algo mÃ¡s sobre ti o tu situaciÃ³n..."
                className="resize-none"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botones de AcciÃ³n */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/login')}
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
    </div>
  )
}
