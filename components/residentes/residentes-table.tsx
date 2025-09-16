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



export default function ResidentesTable() {
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [form, setForm] = useState<{ id_residente: number | undefined; nombre: string; email: string; }>({
    id_residente: undefined,
    nombre: '',
    email: '',
  });

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

  // Handlers para ver, editar y eliminar (solo placeholders)
  const handleView = (id: number) => {
    const residente = residentes.find(r => r.id_residente === id);
    if (residente) {
      setForm(residente);
      setModalMode('view');
      setShowModal(true);
    }
  };

  const handleEdit = (id: number) => {
    const residente = residentes.find(r => r.id_residente === id);
    if (residente) {
      setForm(residente);
      setModalMode('edit');
      setShowModal(true);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      fetchResidentes();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalMode === 'add') {
        await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: form.nombre, email: form.email })
        });
      } else if (modalMode === 'edit' && form.id_residente) {
        await fetch(`/api/usuarios/${form.id_residente}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: form.nombre, email: form.email })
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
          <Bullet variant="default" />
          REGISTRO DE USUARIOS
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchResidentes} disabled={loading}>
            Recargar
          </Button>
          <Button size="sm" variant="default" onClick={() => { setShowModal(true); setModalMode('add'); setForm({ id_residente: undefined, nombre: '', email: '' }); }}>
            Agregar Usuario
          </Button>
        </div>
      </CardHeader>
      {/* Modal para agregar, editar o ver usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <form onSubmit={modalMode === 'view' ? undefined : handleSave} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold mb-2">
              {modalMode === 'add' && 'Agregar Usuario'}
              {modalMode === 'edit' && 'Editar Usuario'}
              {modalMode === 'view' && 'Detalle de Usuario'}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <input required placeholder="Nombre" className="input input-bordered" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} disabled={modalMode==='view'} />
              <input required placeholder="Email" type="email" className="input input-bordered" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} disabled={modalMode==='view'} />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={loading}>Cerrar</Button>
              {modalMode !== 'view' && <Button type="submit" variant="default" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>}
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
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residentes.map((residente) => (
                <TableRow 
                  key={residente.id_residente}
                  className="border-border/20 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {residente.id_residente}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.nombre}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {residente.email}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleView(residente.id_residente)}>
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleEdit(residente.id_residente)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => handleDelete(residente.id_residente)} disabled={loading}>
                      Eliminar
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
