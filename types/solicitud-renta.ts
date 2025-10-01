export interface SolicitudRenta {
  id: number
  departamento_id: number
  nombre_solicitante: string
  correo_solicitante: string
  telefono_solicitante: string
  documento_solicitante: string
  ingreso_mensual: number
  ocupacion: string
  tamano_familia: number
  mascotas: boolean
  detalles_mascotas?: string
  referencias?: Referencias
  documentos?: Documentos
  mensaje?: string
  estado: EstadoSolicitud
  notas_admin?: string
  observaciones?: string
  procesado_por?: number
  procesado_en?: string
  fecha_solicitud: string
  creado_en: string
  
  // Datos relacionados del departamento
  departamento_numero?: string
  departamento_piso?: number
  departamento_dormitorios?: number
  departamento_banos?: number
  departamento_area?: number
  departamento_renta?: number
  departamento_estado?: string
  
  // Datos del procesador
  procesado_por_nombre?: string
  procesado_por_apellido?: string
}

export interface Referencias {
  personal?: ReferenciaPersoanl[]
  laboral?: ReferenciaLaboral[]
}

export interface ReferenciaPersoanl {
  nombre: string
  telefono: string
  relacion: string
}

export interface ReferenciaLaboral {
  empresa: string
  nombre_contacto: string
  telefono: string
  cargo: string
}

export interface Documentos {
  cedula?: boolean
  comprobante_ingresos?: boolean
  referencias_laborales?: boolean
  referencias_personales?: boolean
  otros?: string[]
}

export type EstadoSolicitud = 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | 'retirada'

export interface SolicitudRentaForm {
  departamento_id: number
  nombre_solicitante: string
  correo_solicitante: string
  telefono_solicitante: string
  documento_solicitante: string
  ingreso_mensual: number
  ocupacion: string
  tamano_familia: number
  mascotas: boolean
  detalles_mascotas?: string
  referencias?: Referencias
  documentos?: Documentos
  mensaje?: string
}
