"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Residente } from "@/types/residentes"
import { useEffect, useState } from "react"
import { Bullet } from "@/components/ui/bullet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"



export default function ResidentesTable() {
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  
  interface FormState {
    id: number | undefined;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    numero_documento: string;
    imagen_perfil: string;
    rol_id: number | undefined;
    activo: boolean;
    contrasena: string;
  }

  const emptyForm: FormState = {
    id: undefined,
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    numero_documento: '',
    imagen_perfil: '',
    rol_id: undefined,
    activo: true,
    contrasena: ''
  };

  const [form, setForm] = useState<FormState>(emptyForm);

  // Cargar residentes desde el backend
  const fetchResidentes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setResidentes(Array.isArray(data) ? data : []);
    } catch (e) {
      setResidentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentes();
  }, []);

  // Handlers para ver, editar y eliminar
  const handleView = (id: number) => {
    const residente = residentes.find(r => r.id === id);
    if (residente) {
      setForm({
        id: residente.id,
        nombre: residente.nombre,
        apellido: residente.apellido || '',
        email: residente.email,
        telefono: residente.telefono || '',
        numero_documento: residente.numero_documento,
        imagen_perfil: residente.imagen_perfil || '',
        rol_id: residente.rol_id,
        activo: residente.activo,
        contrasena: '', // No mostramos la contraseña
      });
      setModalMode('view');
      setShowModal(true);
    }
  };

  const handleEdit = (id: number) => {
    const residente = residentes.find(r => r.id === id);
    if (residente) {
      setForm({
        id: residente.id,
        nombre: residente.nombre,
        apellido: residente.apellido || '',
        email: residente.email,
        telefono: residente.telefono || '',
        numero_documento: residente.numero_documento,
        imagen_perfil: residente.imagen_perfil || '',
        rol_id: residente.rol_id,
        activo: residente.activo,
        contrasena: '', // No mostramos la contraseña
      });
      setModalMode('edit');
      setShowModal(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setLoading(true);
      try {
        await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        fetchResidentes();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        numero_documento: form.numero_documento,
        imagen_perfil: form.imagen_perfil,
        rol_id: form.rol_id,
        activo: form.activo,
        ...(modalMode === 'add' && { contrasena: form.contrasena })
      };

      if (modalMode === 'add') {
        await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      } else if (modalMode === 'edit' && form.id) {
        await fetch(`/api/usuarios/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      }
      setShowModal(false);
      fetchResidentes();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="border-b border-border/30 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2.5 text-card-foreground">
          ■ REGISTRO DE USUARIOS
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchResidentes} disabled={loading}>
            RECARGAR
          </Button>
          <Button size="sm" variant="default" onClick={() => { 
            setShowModal(true); 
            setModalMode('add'); 
            setForm(emptyForm);
          }}>
            AGREGAR USUARIO
          </Button>
        </div>
      </CardHeader>
      {/* Modal para agregar, editar o ver usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <form onSubmit={modalMode === 'view' ? undefined : handleSave} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl space-y-4">
            <h2 className="text-lg font-bold mb-4">
              {modalMode === 'add' && 'Agregar Usuario'}
              {modalMode === 'edit' && 'Editar Usuario'}
              {modalMode === 'view' && 'Detalle de Usuario'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  required
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
                  disabled={modalMode==='view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  required
                  placeholder="Apellido"
                  value={form.apellido}
                  onChange={e => setForm(f => ({...f, apellido: e.target.value}))}
                  disabled={modalMode==='view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  disabled={modalMode==='view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={e => setForm(f => ({...f, telefono: e.target.value}))}
                  disabled={modalMode==='view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento</Label>
                <Input
                  id="numero_documento"
                  required
                  placeholder="Número de Documento"
                  value={form.numero_documento}
                  onChange={e => setForm(f => ({...f, numero_documento: e.target.value}))}
                  disabled={modalMode==='view'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagen_perfil">URL Imagen de Perfil</Label>
                <Input
                  id="imagen_perfil"
                  placeholder="URL de la imagen"
                  value={form.imagen_perfil}
                  onChange={e => setForm(f => ({...f, imagen_perfil: e.target.value}))}
                  disabled={modalMode==='view'}
                />
              </div>
              {modalMode === 'add' && (
                <div className="space-y-2">
                  <Label htmlFor="contrasena">Contraseña</Label>
                  <Input
                    id="contrasena"
                    type="password"
                    required
                    placeholder="Contraseña"
                    value={form.contrasena}
                    onChange={e => setForm(f => ({...f, contrasena: e.target.value}))}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="rol_id">Rol ID</Label>
                <Input
                  id="rol_id"
                  type="number"
                  placeholder="ID del Rol"
                  value={form.rol_id || ''}
                  onChange={e => setForm(f => ({...f, rol_id: parseInt(e.target.value) || undefined}))}
                  disabled={modalMode==='view'}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={(checked) => setForm(f => ({...f, activo: checked as boolean}))}
                  disabled={modalMode==='view'}
                />
                <Label htmlFor="activo">Usuario Activo</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
                Cerrar
              </Button>
              {modalMode !== 'view' && (
                <Button type="submit" variant="default" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto table-container">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Apellido</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Teléfono</TableHead>
                <TableHead className="text-muted-foreground">Documento</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residentes.map((residente) => (
                <TableRow 
                  key={residente.id}
                  className="border-border/20 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {residente.id}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.nombre}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.apellido || '-'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.email}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.telefono || '-'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.numero_documento || '-'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    <Badge variant={residente.activo ? "outline-success" : "destructive"}>
                      {residente.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleView(residente.id)}>
                      VER
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleEdit(residente.id)}>
                      EDITAR
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => handleDelete(residente.id)} disabled={loading}>
                      ELIMINAR
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
