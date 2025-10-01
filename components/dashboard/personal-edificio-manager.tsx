"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Users, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PersonalEdificio {
  id: number
  nombre: string
  apellido: string
  cargo: string
  telefono: string
  correo: string
  documento_identidad: string
  fecha_contratacion: string
  salario: number
  activo: boolean
}

export function PersonalEdificioManager() {
  const [personal, setPersonal] = useState<PersonalEdificio[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cargo: "",
    telefono: "",
    correo: "",
    documento_identidad: "",
    salario: ""
  })
  const { toast } = useToast()

  const fetchPersonal = async () => {
    try {
      const response = await fetch("/api/dashboard/personal-edificio")
      const result = await response.json()
      setPersonal(result.data || [])
    } catch (error) {
      console.error("Error fetching personal:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el personal",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersonal()
    const interval = setInterval(fetchPersonal, 120000) // 2 min
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/dashboard/personal-edificio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: "Personal agregado correctamente",
        })
        setIsDialogOpen(false)
        setFormData({
          nombre: "",
          apellido: "",
          cargo: "",
          telefono: "",
          correo: "",
          documento_identidad: "",
          salario: ""
        })
        fetchPersonal()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error creating personal:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el personal",
        variant: "destructive"
      })
    }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm("¿Estás seguro de desactivar este miembro del personal?")) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/personal-edificio?id=${id}`, {
        method: "DELETE"
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: "Personal desactivado correctamente",
        })
        fetchPersonal()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deactivating personal:", error)
      toast({
        title: "Error",
        description: "No se pudo desactivar el personal",
        variant: "destructive"
      })
    }
  }

  const getCargoBadge = (cargo: string) => {
    const colors: Record<string, string> = {
      seguridad: "bg-red-500/10 text-red-500 border-red-500/20",
      limpieza: "bg-green-500/10 text-green-500 border-green-500/20",
      mantenimiento: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      administracion: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    }
    return colors[cargo.toLowerCase()] || ""
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal del Edificio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Personal del Edificio
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Agregar Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Personal</DialogTitle>
                <DialogDescription>
                  Completa los datos del nuevo miembro del personal del edificio
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select 
                    value={formData.cargo} 
                    onValueChange={(value) => setFormData({...formData, cargo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguridad">Seguridad</SelectItem>
                      <SelectItem value="limpieza">Limpieza</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="administracion">Administración</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento_identidad">Documento de Identidad</Label>
                  <Input
                    id="documento_identidad"
                    value={formData.documento_identidad}
                    onChange={(e) => setFormData({...formData, documento_identidad: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salario (opcional)</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Agregar Personal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Fecha Contratación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personal.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No hay personal registrado
                  </TableCell>
                </TableRow>
              ) : (
                personal.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">
                      {person.nombre} {person.apellido}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCargoBadge(person.cargo)}>
                        {person.cargo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{person.documento_identidad}</TableCell>
                    <TableCell>{person.telefono}</TableCell>
                    <TableCell className="text-sm">{person.correo}</TableCell>
                    <TableCell className="font-semibold">
                      ${person.salario ? person.salario.toLocaleString('es-MX') : '0'}
                    </TableCell>
                    <TableCell>
                      {new Date(person.fecha_contratacion).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={person.activo ? "default" : "secondary"}>
                        {person.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {person.activo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(person.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
