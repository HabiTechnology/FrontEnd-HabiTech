export type TipoNotificacion = 
  | 'pago'
  | 'anuncio'
  | 'sistema'
  | 'chat';

export interface Notificacion {
  id: number
  usuario_id: number
  titulo: string
  mensaje: string
  tipo: TipoNotificacion
  id_relacionado: number | null
  icono: string | null
  url_accion: string | null
  leido: boolean
  leido_en: string | null
  creado_en: string
}

export interface NotificacionConUsuario extends Notificacion {
  usuario_nombre?: string
  usuario_correo?: string
  nombre?: string
  apellido?: string
  departamento_numero?: string
  departamento_piso?: number
}

export interface NotificacionesResumen {
  total: number
  no_leidas: number
  por_tipo: Array<{
    tipo: TipoNotificacion
    cantidad: number
  }>
  notificaciones: NotificacionConUsuario[]
}
