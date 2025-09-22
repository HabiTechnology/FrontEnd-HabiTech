"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Building, Edit, Eye, Filter, Search, AlertCircle, CheckCircle, Home, DollarSign, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Departamento, DepartamentoFormData } from "@/types/departamentos"
import DashboardPageLayout from "@/components/dashboard/layout"
import StaggerAnimation from "@/components/animations/stagger-animation"
import { RoleGuard } from "@/components/role-guard"
import DepartamentoDetalleModal from "@/components/departamentos/departamento-detalle-modal"

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFormulario, setShowFormulario] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<Departamento | null>(null)
  const [showDetalle, setShowDetalle] = useState(false)
  const { toast } = useToast()

  // Estado del formulario
  const [formularioData, setFormularioData] = useState<DepartamentoFormData>({
    numero: "",
    piso: 1,
    dormitorios: 1,
    banos: 1,
    area_m2: 0,
    renta_mensual: 0,
    mantenimiento_mensual: 0,
    estado: "disponible",
    descripcion: "",
    servicios: {
      agua: false,
      electricidad: false,
      gas: false,
      internet: false,
      cable: false,
      parqueadero: false,
      balcon: false,
      aire_acondicionado: false,
      lavanderia: false,
      gimnasio: false,
      piscina: false,
      seguridad: false
    },
    imagenes: []
  })

  const [imagenesPreview, setImagenesPreview] = useState<string[]>([])
  const [cargandoImagenes, setCargandoImagenes] = useState(false)

  // Cargar departamentos
  const cargarDepartamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/departamentos')
      
      if (!response.ok) {
        throw new Error('Error al cargar departamentos')
      }

      const data = await response.json()
      setDepartamentos(data)
      setError("")
    } catch (error) {
      console.error('Error cargando departamentos:', error)
      setError('Error al cargar los departamentos')
      toast({
        title: "Error",
        description: "No se pudieron cargar los departamentos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Crear departamento
  const crearDepartamento = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('📝 Datos del formulario antes de enviar:', formularioData)

      // Validaciones del frontend
      if (!formularioData.numero?.trim()) {
        toast({
          title: "Error de validación",
          description: "El número de departamento es requerido",
          variant: "destructive"
        })
        return
      }

      if (formularioData.renta_mensual <= 0) {
        toast({
          title: "Error de validación", 
          description: "La renta mensual debe ser mayor a 0",
          variant: "destructive"
        })
        return
      }

      // Preparar datos para envío
      const datosParaEnvio = {
        ...formularioData,
        // Asegurar que los números son números
        piso: Number(formularioData.piso),
        dormitorios: Number(formularioData.dormitorios),
        banos: Number(formularioData.banos),
        area_m2: formularioData.area_m2 ? Number(formularioData.area_m2) : null,
        renta_mensual: Number(formularioData.renta_mensual),
        mantenimiento_mensual: Number(formularioData.mantenimiento_mensual),
        // Asegurar que servicios e imágenes son objetos válidos
        servicios: formularioData.servicios || {},
        imagenes: formularioData.imagenes || []
      }

      console.log('🚀 Enviando datos al API:', datosParaEnvio)

      const response = await fetch('/api/departamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosParaEnvio)
      })

      console.log('📨 Respuesta del servidor - Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        throw new Error(errorData.error || errorData.details || 'Error al crear departamento')
      }

      const nuevoDepartamento = await response.json()
      console.log('✅ Departamento creado exitosamente:', nuevoDepartamento)
      
      toast({
        title: "¡Éxito!",
        description: `Departamento ${nuevoDepartamento.numero} creado exitosamente`,
      })

      // Recargar lista y cerrar formulario
      await cargarDepartamentos()
      setShowFormulario(false)
      
      // Resetear formulario
      setFormularioData({
        numero: "",
        piso: 1,
        dormitorios: 1,
        banos: 1,
        area_m2: 0,
        renta_mensual: 0,
        mantenimiento_mensual: 0,
        estado: "disponible",
        descripcion: "",
        servicios: {
          agua: false,
          electricidad: false,
          gas: false,
          internet: false,
          cable: false,
          parqueadero: false,
          balcon: false,
          aire_acondicionado: false,
          lavanderia: false,
          gimnasio: false,
          piscina: false,
          seguridad: false
        },
        imagenes: []
      })
      setImagenesPreview([])

    } catch (error) {
      console.error('Error creando departamento:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear departamento",
        variant: "destructive"
      })
    }
  }

  // Filtrar departamentos
  const departamentosFiltrados = departamentos.filter(dept => {
    const cumpleFiltroEstado = filtroEstado === "todos" || dept.estado === filtroEstado
    const cumpleBusqueda = busqueda === "" || 
      dept.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      dept.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    
    return cumpleFiltroEstado && cumpleBusqueda
  })

  // Obtener color del estado
  const obtenerColorEstado = (estado: string) => {
    const colores = {
      disponible: "bg-green-100 text-green-800 border-green-200",
      ocupado: "bg-red-100 text-red-800 border-red-200", 
      mantenimiento: "bg-yellow-100 text-yellow-800 border-yellow-200",
      no_disponible: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colores[estado as keyof typeof colores] || "bg-gray-100 text-gray-800"
  }

  // Formatear moneda
  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(cantidad)
  }

  // Cargar datos al montar
  useEffect(() => {
    cargarDepartamentos()
  }, [])

  // Función para ver detalles
  const verDetalle = (departamento: Departamento) => {
    setDepartamentoSeleccionado(departamento)
    setShowDetalle(true)
  }

  // Manejar carga de imágenes
  const manejarImagenes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setCargandoImagenes(true)
    const nuevasImagenes: string[] = []
    const nuevosPreview: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive"
          })
          continue
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Error", 
            description: `${file.name} es muy grande (máximo 5MB)`,
            variant: "destructive"
          })
          continue
        }

        // Crear preview
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            nuevosPreview.push(e.target.result as string)
            setImagenesPreview(prev => [...prev, e.target?.result as string])
          }
        }
        reader.readAsDataURL(file)

        // Por ahora guardamos el nombre del archivo
        // En producción aquí subirías a un servicio como AWS S3, Cloudinary, etc.
        nuevasImagenes.push(file.name)
      }

      setFormularioData(prev => ({
        ...prev,
        imagenes: [...(prev.imagenes || []), ...nuevasImagenes]
      }))

      toast({
        title: "Imágenes cargadas",
        description: `${nuevasImagenes.length} imagen(es) agregada(s)`
      })

    } catch (error) {
      console.error('Error cargando imágenes:', error)
      toast({
        title: "Error",
        description: "Error al cargar las imágenes",
        variant: "destructive"
      })
    } finally {
      setCargandoImagenes(false)
    }
  }

  // Remover imagen
  const removerImagen = (index: number) => {
    setFormularioData(prev => ({
      ...prev,
      imagenes: prev.imagenes?.filter((_: any, i: number) => i !== index) || []
    }))
    setImagenesPreview(prev => prev.filter((_: any, i: number) => i !== index))
  }

  // Manejar cambio de servicios
  const manejarServicio = (servicio: string, valor: boolean) => {
    setFormularioData(prev => ({
      ...prev,
      servicios: {
        ...prev.servicios,
        [servicio]: valor
      }
    }))
  }

  // Lista de servicios disponibles
  const serviciosDisponibles = [
    { key: 'agua', label: 'Agua', icon: '💧' },
    { key: 'electricidad', label: 'Electricidad', icon: '⚡' },
    { key: 'gas', label: 'Gas', icon: '🔥' },
    { key: 'internet', label: 'Internet', icon: '📶' },
    { key: 'cable', label: 'TV Cable', icon: '📺' },
    { key: 'parqueadero', label: 'Parqueadero', icon: '🚗' },
    { key: 'balcon', label: 'Balcón', icon: '🏖️' },
    { key: 'aire_acondicionado', label: 'Aire Acondicionado', icon: '❄️' },
    { key: 'lavanderia', label: 'Lavandería', icon: '👕' },
    { key: 'gimnasio', label: 'Gimnasio', icon: '💪' },
    { key: 'piscina', label: 'Piscina', icon: '🏊' },
    { key: 'seguridad', label: 'Seguridad 24/7', icon: '🛡️' }
  ]

  // Estadísticas
  const estadisticas = {
    total: departamentos.length,
    disponibles: departamentos.filter(d => d.estado === 'disponible').length,
    ocupados: departamentos.filter(d => d.estado === 'ocupado').length,
    mantenimiento: departamentos.filter(d => d.estado === 'mantenimiento').length,
    rentaPromedio: departamentos.length > 0 
      ? Math.round(departamentos.reduce((sum, d) => sum + d.renta_mensual, 0) / departamentos.length)
      : 0
  }

  return (
    <RoleGuard allowedRoles={['admin', 'resident']}>
      <DashboardPageLayout
        header={{
          title: "Gestión de Departamentos",
          description: "Administra los departamentos del edificio",
          icon: Building
        }}
      >
        <div className="space-y-6">
          {/* Header con botón */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div></div>
            
            <Dialog open={showFormulario} onOpenChange={setShowFormulario}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Departamento
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Departamento</DialogTitle>
                <DialogDescription>
                  Complete todos los datos del departamento
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={crearDepartamento} className="space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información Básica</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numero">Número de Departamento *</Label>
                      <Input
                        id="numero"
                        value={formularioData.numero}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          numero: e.target.value
                        }))}
                        placeholder="ej: 101, A202, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="piso">Piso *</Label>
                      <Input
                        id="piso"
                        type="number"
                        min="1"
                        value={formularioData.piso}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          piso: parseInt(e.target.value) || 1
                        }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dormitorios">Dormitorios *</Label>
                      <Input
                        id="dormitorios"
                        type="number"
                        min="0"
                        value={formularioData.dormitorios}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          dormitorios: parseInt(e.target.value) || 0
                        }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="banos">Baños *</Label>
                      <Input
                        id="banos"
                        type="number"
                        min="1"
                        value={formularioData.banos}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          banos: parseInt(e.target.value) || 1
                        }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="area_m2">Área (m²)</Label>
                      <Input
                        id="area_m2"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formularioData.area_m2}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          area_m2: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="ej: 65.50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado del Departamento</Label>
                    <Select 
                      value={formularioData.estado} 
                      onValueChange={(value) => setFormularioData(prev => ({
                        ...prev,
                        estado: value as any
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">🟢 Disponible</SelectItem>
                        <SelectItem value="ocupado">🔴 Ocupado</SelectItem>
                        <SelectItem value="mantenimiento">🟡 En Mantenimiento</SelectItem>
                        <SelectItem value="no_disponible">⚫ No Disponible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formularioData.descripcion}
                      onChange={(e) => setFormularioData(prev => ({
                        ...prev,
                        descripcion: e.target.value
                      }))}
                      placeholder="Describe las características especiales del departamento..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información Financiera</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="renta_mensual">Renta Mensual (COP) *</Label>
                      <Input
                        id="renta_mensual"
                        type="number"
                        min="0"
                        step="1000"
                        value={formularioData.renta_mensual}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          renta_mensual: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="ej: 500000"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mantenimiento_mensual">Mantenimiento Mensual (COP) *</Label>
                      <Input
                        id="mantenimiento_mensual"
                        type="number"
                        min="0"
                        step="1000"
                        value={formularioData.mantenimiento_mensual}
                        onChange={(e) => setFormularioData(prev => ({
                          ...prev,
                          mantenimiento_mensual: parseFloat(e.target.value) || 0
                        }))}
                        placeholder="ej: 50000"
                        required
                      />
                    </div>
                  </div>

                  {/* Total calculado */}
                  {(formularioData.renta_mensual > 0 || formularioData.mantenimiento_mensual > 0) && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Mensual:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatearMoneda(formularioData.renta_mensual + formularioData.mantenimiento_mensual)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Servicios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Servicios Incluidos</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviciosDisponibles.map((servicio) => (
                      <div key={servicio.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={servicio.key}
                          checked={formularioData.servicios?.[servicio.key] || false}
                          onChange={(e) => manejarServicio(servicio.key, e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={servicio.key} className="flex items-center gap-2 cursor-pointer">
                          <span>{servicio.icon}</span>
                          <span className="text-sm">{servicio.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Imágenes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Galería de Imágenes</h3>
                  
                  <div>
                    <Label htmlFor="imagenes">Subir Imágenes</Label>
                    <Input
                      id="imagenes"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={manejarImagenes}
                      disabled={cargandoImagenes}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos: JPG, PNG, GIF. Máximo 5MB por imagen.
                    </p>
                  </div>

                  {/* Preview de imágenes */}
                  {imagenesPreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imagenesPreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                            onClick={() => removerImagen(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lista de nombres de archivos */}
                  {formularioData.imagenes && formularioData.imagenes.length > 0 && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">Archivos seleccionados:</p>
                      <ul className="text-xs space-y-1">
                        {formularioData.imagenes.map((nombre: any, index: number) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{typeof nombre === 'string' ? nombre : `Imagen ${index + 1}`}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 text-destructive"
                              onClick={() => removerImagen(index)}
                            >
                              ×
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={cargandoImagenes}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {cargandoImagenes ? 'Procesando...' : 'Crear Departamento'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowFormulario(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <StaggerAnimation delay={200} staggerDelay={100}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{estadisticas.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disponibles</p>
                    <p className="text-2xl font-bold text-green-600">{estadisticas.disponibles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ocupados</p>
                    <p className="text-2xl font-bold text-red-600">{estadisticas.ocupados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mantenimiento</p>
                    <p className="text-2xl font-bold text-yellow-600">{estadisticas.mantenimiento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Renta Prom.</p>
                    <p className="text-lg font-bold">{formatearMoneda(estadisticas.rentaPromedio)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggerAnimation>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="no_disponible">No Disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Departamentos */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <StaggerAnimation delay={300} staggerDelay={50}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departamentosFiltrados.map((departamento) => (
                <Card key={departamento.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Depto {departamento.numero}</CardTitle>
                      <Badge className={obtenerColorEstado(departamento.estado)}>
                        {departamento.estado}
                      </Badge>
                    </div>
                    <CardDescription>Piso {departamento.piso}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Habitaciones:</span>
                      <span>{departamento.dormitorios} dorm, {departamento.banos} baños</span>
                    </div>
                    
                    {departamento.area_m2 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Área:</span>
                        <span>{departamento.area_m2} m²</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Renta:</span>
                      <span className="font-semibold">{formatearMoneda(departamento.renta_mensual)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mantenimiento:</span>
                      <span>{formatearMoneda(departamento.mantenimiento_mensual)}</span>
                    </div>
                    
                    {departamento.descripcion && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {departamento.descripcion}
                      </p>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => verDetalle(departamento)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </StaggerAnimation>
        )}

        {!loading && departamentosFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron departamentos</h3>
              <p className="text-muted-foreground mb-4">
                {busqueda || filtroEstado !== "todos" 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay departamentos registrados"
                }
              </p>
              {(!busqueda && filtroEstado === "todos") && (
                <Button onClick={() => setShowFormulario(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Departamento
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </div>

        {/* Modal de Detalle */}
        <DepartamentoDetalleModal
          departamento={departamentoSeleccionado}
          open={showDetalle}
          onClose={() => {
            setShowDetalle(false)
            setDepartamentoSeleccionado(null)
          }}
        />
      </DashboardPageLayout>
    </RoleGuard>
  )
}