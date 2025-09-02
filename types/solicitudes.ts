export interface DocumentoAdjunto {
  id: string
  nombre: string
  tipo: "INE" | "Comprobante_Ingresos" | "Referencias_Laborales" | "Comprobante_Domicilio" | "Estados_Cuenta" | "Otros"
  url: string
  fecha_subida: string
  tamaño: number // en bytes
  verificado: boolean
}

export interface ReferenciaContacto {
  id: string
  nombre: string
  telefono: string
  email?: string
  relacion: "Laboral" | "Personal" | "Familiar" | "Bancaria"
  empresa?: string
  verificado: boolean
  fecha_verificacion?: string
  comentarios?: string
}

export interface SolicitudRenta {
  id_solicitud: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  telefono: string
  departamento_solicitado: string
  piso_preferido: number
  tipo_solicitud: "Renta" | "Compra" | "Temporal"
  estado: "Pendiente" | "En_Revision" | "Aprobada" | "Rechazada" | "Completada"
  fecha_solicitud: string
  fecha_respuesta?: string
  presupuesto_min: number
  presupuesto_max: number
  comentarios?: string
  documentos_completos: boolean
  documentos_adjuntos?: DocumentoAdjunto[]
  referencias_verificadas: boolean
  referencias_contactos?: ReferenciaContacto[]
  score_crediticio?: number
}

export interface SolicitudStats {
  totalSolicitudes: number
  pendientes: number
  aprobadas: number
  rechazadas: number
  completadas: number
}

export interface SolicitudData {
  mes: string;
  nuevas: number;
  aprobadas: number;
  rechazadas: number;
}
