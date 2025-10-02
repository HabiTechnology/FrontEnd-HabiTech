"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import NotificationItem from "./notification-item";
import { AnimatePresence, motion } from "framer-motion";
import type { Notificacion } from "@/types/notifications";

interface NotificationsProps {
  usuarioId?: number;
}

export default function Notifications({ usuarioId = 1 }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Refrescar cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [usuarioId]);

  const fetchNotifications = async () => {
    try {
      console.log("🔍 Fetching ALL notifications from database");
      const response = await fetch(`/api/notificaciones/todas?limite=20`);
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Notificaciones recibidas:", data);
      setNotifications(data.notificaciones || []);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.leido).length;

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: true }),
      });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, leido: true, leido_en: new Date().toISOString() } : notif))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAll = async () => {
    try {
      await fetch(`/api/notificaciones/marcar-todas-leidas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioId }),
      });
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, leido: true, leido_en: new Date().toISOString() }))
      );
    } catch (error) {
      console.error("Error clearing all:", error);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex items-center justify-between pl-3 pr-1">
          <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
            <Bullet />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-accent p-1.5 overflow-hidden">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <Bullet />}
          Notificaciones
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            className="opacity-50 hover:opacity-100 uppercase text-xs"
            size="sm"
            variant="ghost"
            onClick={clearAll}
          >
            Marcar todas
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No hay notificaciones
            </p>
          </div>
        ) : (
          <div 
            className="space-y-2 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-transparent hover:scrollbar-thumb-orange-500/70"
            style={{ 
              maxHeight: 'calc(3 * 120px)', // Aproximadamente 3 notificaciones
              minHeight: '120px'
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {notifications.map((notification) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  key={notification.id}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {notifications.length > 3 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground">
              {notifications.length} notificaciones totales • Scroll para ver más ↕️
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
