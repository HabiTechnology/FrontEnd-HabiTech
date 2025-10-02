import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notificacion } from "@/types/notifications";
import { Bell, CheckCircle, AlertCircle, Info, DollarSign, Wrench, FileText, Settings } from "lucide-react";

interface NotificationItemProps {
  notification: Notificacion;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    else if (minutes < 60) return `${minutes}min`;
    else if (hours < 24) return `${hours}h`;
    else if (days < 7) return `${days}d`;
    else return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "pago": return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case "anuncio": return <Info className="h-4 w-4 text-cyan-600" />;
      case "sistema": return <Settings className="h-4 w-4 text-gray-600" />;
      case "chat": return <Info className="h-4 w-4 text-purple-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      pago: "bg-emerald-500",
      anuncio: "bg-cyan-500",
      sistema: "bg-gray-500",
      chat: "bg-purple-500"
    };
    return colors[tipo] || "bg-blue-500";
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      pago: "Pago",
      anuncio: "Anuncio",
      sistema: "Sistema",
      chat: "Chat"
    };
    return labels[tipo] || tipo;
  };

  const handleNotificationClick = () => {
    if (!notification.leido) onMarkAsRead(notification.id);
    if (notification.url_accion) window.location.href = notification.url_accion;
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div className={cn("notification-habitech group p-2.5 rounded-lg border transition-all duration-200 hover:shadow-sm hover-habitech", !notification.leido && "cursor-pointer", notification.leido ? "bg-background/50 border-border/30 opacity-75" : "bg-background border-border shadow-sm")} onClick={handleNotificationClick}>
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notification.tipo)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className={cn("text-sm truncate", !notification.leido && "font-semibold")}>{notification.titulo}</h4>
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 uppercase">{getTipoBadge(notification.tipo)}</Badge>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={handleClearClick}><span className="sr-only">Eliminar</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></Button>
          </div>
          <p className={cn("text-xs mb-1.5 line-clamp-2", notification.leido ? "text-muted-foreground" : "text-foreground")}>{notification.mensaje}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{formatTimestamp(notification.creado_en)}</span>
              {(notification as any).nombre && (
                <span className="text-xs text-muted-foreground/70">
                  📬 {(notification as any).nombre} {(notification as any).apellido} 
                  {(notification as any).departamento_numero && ` · Depto ${(notification as any).departamento_numero}`}
                </span>
              )}
            </div>
            {!notification.leido && <div className={cn("w-1.5 h-1.5 rounded-full", getTypeColor(notification.tipo))} />}
          </div>
        </div>
      </div>
    </div>
  );
}
