"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, DollarSign, Info, Settings, MessageCircle, Loader2, Building2 } from "lucide-react";
import type { TipoNotificacion } from "@/types/notifications";

interface Residente {
  id: number;
  usuario_id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  departamento_numero: string;
  departamento_piso: number;
  tipo_relacion: string;
}

interface CreateNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateNotificationModal({ open, onClose, onSuccess }: CreateNotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingResidentes, setLoadingResidentes] = useState(false);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [destinatario, setDestinatario] = useState<"todos" | "uno">("todos");
  const [usuarioId, setUsuarioId] = useState("");
  const [tipo, setTipo] = useState<TipoNotificacion>("sistema");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const tiposInfo = {
    pago: { label: "Pago", icon: DollarSign, color: "text-emerald-600" },
    anuncio: { label: "Anuncio", icon: Info, color: "text-cyan-600" },
    sistema: { label: "Sistema", icon: Settings, color: "text-gray-600" },
    chat: { label: "Chat", icon: MessageCircle, color: "text-purple-600" },
  };

  // Cargar residentes cuando se abre el modal
  useEffect(() => {
    if (open && destinatario === "uno") {
      fetchResidentes();
    }
  }, [open, destinatario]);

  const fetchResidentes = async () => {
    try {
      setLoadingResidentes(true);
      const response = await fetch("/api/residentes/lista");
      const data = await response.json();
      setResidentes(data.residentes || []);
    } catch (error) {
      console.error("Error cargando residentes:", error);
    } finally {
      setLoadingResidentes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !mensaje.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (destinatario === "uno" && !usuarioId) {
      alert("Por favor ingresa el ID del usuario");
      return;
    }

    setLoading(true);

    try {
      if (destinatario === "todos") {
        // Enviar a todos los residentes
        const response = await fetch("/api/notificaciones/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, mensaje, tipo }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al enviar notificaciones");
        }

        const data = await response.json();
        alert(`✅ Notificaciones enviadas a ${data.count} residentes`);
      } else {
        // Enviar a un usuario específico
        const response = await fetch("/api/notificaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: parseInt(usuarioId),
            titulo,
            mensaje,
            tipo,
            icono: getIconName(tipo),
            url_accion: "/notificaciones",
            leido: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al crear notificación");
        }

        const data = await response.json();
        const residenteSeleccionado = residentes.find(r => r.usuario_id === parseInt(usuarioId));
        alert(`✅ Notificación enviada a ${residenteSeleccionado?.nombre || 'usuario'} ${residenteSeleccionado?.apellido || ''}`);
      }

      // Resetear formulario
      setTitulo("");
      setMensaje("");
      setUsuarioId("");
      setDestinatario("todos");
      setTipo("sistema");
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (tipo: TipoNotificacion): string => {
    const iconMap = {
      pago: "dollar-sign",
      anuncio: "info",
      sistema: "settings",
      chat: "message-circle",
    };
    return iconMap[tipo] || "info";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Crear Nueva Notificación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destinatario */}
          <div className="space-y-2">
            <Label>Destinatario</Label>
            <RadioGroup value={destinatario} onValueChange={(v) => setDestinatario(v as "todos" | "uno")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todos" id="todos" />
                <Label htmlFor="todos" className="font-normal cursor-pointer">
                  Todos los residentes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="uno" id="uno" />
                <Label htmlFor="uno" className="font-normal cursor-pointer">
                  Un residente específico
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Selector de Residente (solo si es para uno) */}
          {destinatario === "uno" && (
            <div className="space-y-2">
              <Label htmlFor="residente">Seleccionar Residente</Label>
              {loadingResidentes ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Cargando residentes...</span>
                </div>
              ) : (
                <Select value={usuarioId} onValueChange={setUsuarioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un residente" />
                  </SelectTrigger>
                  <SelectContent>
                    {residentes.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No hay residentes disponibles
                      </div>
                    ) : (
                      residentes.map((residente) => (
                        <SelectItem key={residente.id} value={residente.usuario_id.toString()}>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{residente.nombre} {residente.apellido}</span>
                            </div>
                            {residente.departamento_numero && residente.departamento_piso ? (
                              <span className="text-xs text-muted-foreground ml-6">
                                Piso {residente.departamento_piso}, Depto {residente.departamento_numero} ({residente.tipo_relacion})
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground ml-6">
                                Sin departamento asignado
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Tipo de notificación */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Notificación</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoNotificacion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tiposInfo).map(([key, info]) => {
                  const Icon = info.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${info.color}`} />
                        {info.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              placeholder="Ej: Mantenimiento programado"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              maxLength={255}
            />
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea
              id="mensaje"
              placeholder="Escribe el mensaje de la notificación..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Crear Notificación
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
