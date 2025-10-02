"use client"

import { useEffect, useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import BellIcon from "@/components/icons/bell"
import { PageTransition } from "@/components/animations/page-transition"
import StaggerAnimation from "@/components/animations/stagger-animation"
import FloatingElement from "@/components/animations/floating-element"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Notificacion, NotificacionesResumen } from "@/types/notifications"
import NotificationItem from "@/components/dashboard/notifications/notification-item"
import CreateNotificationModal from "@/components/notifications/create-notification-modal"
import { Bell, CheckCircle2, Trash2, RefreshCw, Plus, User } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Residente {
  id: number
  usuario_id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string
  departamento_numero: string
  departamento_piso: number
  tipo_relacion: string
}

export default function NotificacionesPage() {
  const [resumen, setResumen] = useState<NotificacionesResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas' | 'leidas'>('todas')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [residentes, setResidentes] = useState<Residente[]>([])
  const [residentesLoading, setResidentesLoading] = useState(true)
  const [usuarioId, setUsuarioId] = useState<number>(1) // Usuario seleccionado actualmente

  useEffect(() => {
    fetchResidentes()
  }, [])

  useEffect(() => {
    fetchNotificaciones()
  }, [usuarioId])

  const fetchResidentes = async () => {
    try {
      setResidentesLoading(true)
      const response = await fetch('/api/residentes/lista')
      const data = await response.json()
      setResidentes(data.residentes || [])
    } catch (error) {
      console.error("Error fetching residentes:", error)
    } finally {
      setResidentesLoading(false)
    }
  }

  const fetchNotificaciones = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notificaciones?usuario_id=${usuarioId}&limite=100`)
      const data = await response.json()
      setResumen(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: true }),
      })
      await fetchNotificaciones()
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const eliminarNotificacion = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: "DELETE",
      })
      await fetchNotificaciones()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      await fetch(`/api/notificaciones/marcar-todas-leidas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioId }),
      })
      await fetchNotificaciones()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const notificacionesFiltradas = resumen?.notificaciones.filter((n) => {
    if (filtro === 'no_leidas') return !n.leido
    if (filtro === 'leidas') return n.leido
    return true
  }) || []

  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Centro de Notificaciones",
          description: "Gestión y seguimiento de notificaciones del edificio",
          icon: BellIcon,
        }}
      >
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          {[...Array(4)].map((_, i) => {
            const positions = [
              { top: '12%', left: '15%' },
              { top: '35%', right: '10%' },
              { bottom: '40%', left: '8%' },
              { bottom: '20%', right: '12%' }
            ];
            
            return (
              <FloatingElement key={i} intensity={4} duration={3500 + (i * 300)}>
                <div
                  className="absolute w-12 h-12 bg-orange-500/10 dark:bg-orange-400/15 rounded-full backdrop-blur-sm"
                  style={positions[i]}
                />
              </FloatingElement>
            );
          })}
        </div>

        <div className="relative z-1">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumen?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Notificaciones totales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Leídas</CardTitle>
                <Badge className="h-5">{resumen?.no_leidas || 0}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{resumen?.no_leidas || 0}</div>
                <p className="text-xs text-muted-foreground">Pendientes de revisar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acciones</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Crear Notificación
                </Button>
                <Button size="sm" variant="secondary" onClick={marcarTodasComoLeidas} disabled={!resumen?.no_leidas}>
                  Marcar todas
                </Button>
                <Button size="sm" variant="outline" onClick={fetchNotificaciones}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Selector de Residente */}
          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5" />
                Seleccionar Residente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {residentesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Cargando residentes...</span>
                </div>
              ) : (
                <Select
                  value={usuarioId.toString()}
                  onValueChange={(value) => setUsuarioId(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un residente" />
                  </SelectTrigger>
                  <SelectContent>
                    {residentes.map((residente) => (
                      <SelectItem
                        key={residente.usuario_id}
                        value={residente.usuario_id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {residente.nombre} {residente.apellido}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Piso {residente.departamento_piso}, Depto {residente.departamento_numero} ({residente.tipo_relacion})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Filtros */}
          <Tabs value={filtro} onValueChange={(v) => setFiltro(v as any)} className="mb-4">
            <TabsList>
              <TabsTrigger value="todas">Todas ({resumen?.total || 0})</TabsTrigger>
              <TabsTrigger value="no_leidas">No leídas ({resumen?.no_leidas || 0})</TabsTrigger>
              <TabsTrigger value="leidas">Leídas ({(resumen?.total || 0) - (resumen?.no_leidas || 0)})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Lista de Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="mt-1 mb-5">Notificaciones</CardTitle>
                <CardDescription className="mt-0 mb-1">
                {filtro === 'todas' && 'Todas tus notificaciones'}
                {filtro === 'no_leidas' && 'Notificaciones pendientes de leer'}
                {filtro === 'leidas' && 'Notificaciones ya leídas'}
                </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Cargando notificaciones...</p>
                </div>
              ) : notificacionesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay notificaciones</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <StaggerAnimation delay={100} staggerDelay={50}>
                    {notificacionesFiltradas.map((notif) => (
                      <div key={notif.id} className="grid-item">
                        <NotificationItem
                          notification={notif}
                          onMarkAsRead={marcarComoLeida}
                          onDelete={eliminarNotificacion}
                        />
                      </div>
                    ))}
                  </StaggerAnimation>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de Crear Notificación */}
        <CreateNotificationModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchNotificaciones()
          }}
        />
      </DashboardPageLayout>
    </PageTransition>
  )
}
