"use client"

import React, { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockSolicitudes } from "@/data/solicitudes-mock"
import type { SolicitudRenta } from "@/types/solicitudes"
import { Bullet } from "@/components/ui/bullet"
import DocumentosViewer from "./documentos-viewer"

const getStatusVariant = (estado: SolicitudRenta["estado"]) => {
  switch (estado) {
    case "Pendiente":
      return "outline-warning" as const
    case "En_Revision":
      return "outline" as const
    case "Aprobada":
      return "outline-success" as const
    case "Rechazada":
      return "outline-destructive" as const
    case "Completada":
      return "default" as const
    default:
      return "secondary" as const
  }
}

const getTipoColor = (tipo: SolicitudRenta["tipo_solicitud"]) => {
  switch (tipo) {
    case "Renta":
      return "border-primary text-primary"
    case "Compra":
      return "border-success text-success"
    case "Temporal":
      return "border-warning text-warning"
    default:
      return "border-muted-foreground text-muted-foreground"
  }
}

export default function SolicitudesTable() {
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes)
  const [razonRechazo, setRazonRechazo] = useState("")
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<number | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [dialogoDetalles, setDialogoDetalles] = useState(false)
  const [solicitudDetalles, setSolicitudDetalles] = useState<SolicitudRenta | null>(null)

  const aprobarSolicitud = (id: number) => {
    setSolicitudes(prev => 
      prev.map(solicitud => 
        solicitud.id_solicitud === id 
          ? { ...solicitud, estado: "Aprobada" as const, fecha_respuesta: new Date().toISOString().split('T')[0] }
          : solicitud
      )
    )
  }

  const abrirDialogoRechazo = (id: number) => {
    setSolicitudSeleccionada(id)
    setRazonRechazo("")
    setDialogoAbierto(true)
  }

  const rechazarSolicitud = () => {
    if (solicitudSeleccionada && razonRechazo.trim()) {
      setSolicitudes(prev => 
        prev.map(solicitud => 
          solicitud.id_solicitud === solicitudSeleccionada 
            ? { 
                ...solicitud, 
                estado: "Rechazada" as const, 
                fecha_respuesta: new Date().toISOString().split('T')[0],
                comentarios: `${solicitud.comentarios || ""}\n\nRazón de rechazo: ${razonRechazo}`
              }
            : solicitud
        )
      )
      setDialogoAbierto(false)
      setSolicitudSeleccionada(null)
      setRazonRechazo("")
    }
  }

  const verDetalles = (solicitud: SolicitudRenta) => {
    setSolicitudDetalles(solicitud)
    setDialogoDetalles(true)
  }

  const formatearPresupuesto = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="border-b border-border/30 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-card-foreground">
          <Bullet variant="default" />
          SOLICITUDES DE RENTA - GESTIÓN
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline">
            Filtrar Pendientes
          </Button>
          <Button size="sm" variant="outline">
            Exportar Reporte
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto table-container">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Solicitante</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Teléfono</TableHead>
                <TableHead className="text-muted-foreground">Dept. Solicitado</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Presupuesto</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Score</TableHead>
                <TableHead className="text-muted-foreground">Fecha</TableHead>
                <TableHead className="text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((solicitud) => (
                <TableRow 
                  key={solicitud.id_solicitud}
                  className="border-border/20 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    {solicitud.id_solicitud}
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {solicitud.nombre} {solicitud.apellidoPaterno}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {solicitud.apellidoMaterno}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {solicitud.email}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {solicitud.telefono}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {solicitud.departamento_solicitado}
                    {solicitud.piso_preferido && (
                      <div className="text-sm text-muted-foreground">
                        Piso {solicitud.piso_preferido}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getTipoColor(solicitud.tipo_solicitud)}
                    >
                      {solicitud.tipo_solicitud}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="text-sm">
                      {formatearPresupuesto(solicitud.presupuesto_min, solicitud.presupuesto_max)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(solicitud.estado)}>
                      {solicitud.estado.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {solicitud.score_crediticio && (
                      <span className={`font-medium ${
                        solicitud.score_crediticio >= 700 ? 'text-success' : 
                        solicitud.score_crediticio >= 600 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {solicitud.score_crediticio}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-2"
                        onClick={() => verDetalles(solicitud)}
                      >
                        Ver
                      </Button>
                      {(solicitud.estado === "Pendiente" || solicitud.estado === "En_Revision") && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 border-success text-success hover:bg-success hover:text-white"
                            onClick={() => aprobarSolicitud(solicitud.id_solicitud)}
                          >
                            Aprobar
                          </Button>
                          <Dialog open={dialogoAbierto && solicitudSeleccionada === solicitud.id_solicitud} onOpenChange={setDialogoAbierto}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                                onClick={() => abrirDialogoRechazo(solicitud.id_solicitud)}
                              >
                                Rechazar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Rechazar Solicitud</DialogTitle>
                                <DialogDescription>
                                  ¿Estás seguro de que deseas rechazar la solicitud de {solicitud.nombre} {solicitud.apellidoPaterno}?
                                  Por favor, proporciona una razón para el rechazo.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="razon" className="text-right">
                                    Razón:
                                  </Label>
                                  <Textarea
                                    id="razon"
                                    value={razonRechazo}
                                    onChange={(e) => setRazonRechazo(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Explica la razón del rechazo..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogoAbierto(false)}>
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={rechazarSolicitud}
                                  disabled={!razonRechazo.trim()}
                                >
                                  Rechazar Solicitud
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Dialog de Detalles Completos */}
      <Dialog open={dialogoDetalles} onOpenChange={setDialogoDetalles}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles Completos de la Solicitud</DialogTitle>
            <DialogDescription>
              Información detallada del solicitante y documentación adjunta
            </DialogDescription>
          </DialogHeader>
          {solicitudDetalles && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground border-b border-border pb-1">
                  Información Personal y Solicitud
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Nombre Completo:</span>
                    <p className="text-foreground">
                      {solicitudDetalles.nombre} {solicitudDetalles.apellidoPaterno} {solicitudDetalles.apellidoMaterno}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <p className="text-foreground">{solicitudDetalles.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Teléfono:</span>
                    <p className="text-foreground">{solicitudDetalles.telefono}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Score Crediticio:</span>
                    {solicitudDetalles.score_crediticio ? (
                      <p className={`font-medium ${
                        solicitudDetalles.score_crediticio >= 700 ? 'text-green-600' : 
                        solicitudDetalles.score_crediticio >= 600 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {solicitudDetalles.score_crediticio} {
                          solicitudDetalles.score_crediticio >= 700 ? '(Excelente)' : 
                          solicitudDetalles.score_crediticio >= 600 ? '(Bueno)' : '(Regular)'
                        }
                      </p>
                    ) : (
                      <p className="text-muted-foreground">No disponible</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Departamento Solicitado:</span>
                    <p className="text-foreground">{solicitudDetalles.departamento_solicitado}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Piso Preferido:</span>
                    <p className="text-foreground">Piso {solicitudDetalles.piso_preferido}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tipo de Solicitud:</span>
                    <p className="text-foreground">
                      <Badge variant="outline" className={getTipoColor(solicitudDetalles.tipo_solicitud)}>
                        {solicitudDetalles.tipo_solicitud}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Estado:</span>
                    <p className="text-foreground">
                      <Badge variant={getStatusVariant(solicitudDetalles.estado)}>
                        {solicitudDetalles.estado.replace('_', ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Presupuesto:</span>
                    <p className="text-foreground">
                      {formatearPresupuesto(solicitudDetalles.presupuesto_min, solicitudDetalles.presupuesto_max)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Fecha de Solicitud:</span>
                    <p className="text-foreground">
                      {new Date(solicitudDetalles.fecha_solicitud).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comentarios */}
              {solicitudDetalles.comentarios && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground border-b border-border pb-1">
                    Comentarios
                  </h4>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {solicitudDetalles.comentarios}
                    </p>
                  </div>
                </div>
              )}

              {/* Documentos y Referencias */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b border-border pb-1">
                  Documentos y Referencias
                </h4>
                <DocumentosViewer 
                  documentos={solicitudDetalles.documentos_adjuntos}
                  referencias={solicitudDetalles.referencias_contactos}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoDetalles(false)}>
              Cerrar
            </Button>
            {solicitudDetalles && (solicitudDetalles.estado === "Pendiente" || solicitudDetalles.estado === "En_Revision") && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  onClick={() => {
                    aprobarSolicitud(solicitudDetalles.id_solicitud)
                    setDialogoDetalles(false)
                  }}
                >
                  Aprobar
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => {
                    abrirDialogoRechazo(solicitudDetalles.id_solicitud)
                    setDialogoDetalles(false)
                  }}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
