export interface ResidenteCompleto {
  id: number;
  usuario_id: number;
  departamento_id: number;
  tipo_relacion: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  nombre_contacto_emergencia?: string;
  telefono_contacto_emergencia?: string;
  es_principal: boolean;
  activo: boolean;
  creado_en: string;
  // Datos relacionados
  usuario?: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    numero_documento: string;
    imagen_perfil?: string;
  };
  departamento?: {
    numero: string;
    piso: number;
    dormitorios: number;
    banos: number;
    area_m2?: number;
    renta_mensual: number;
    estado: string;
  };
}

// Tipos legacy para mantener compatibilidad con componentes existentes
export interface UsuarioLegacy {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  avatar_url?: string;
  fecha_registro: string;
  ultimo_acceso?: string;
  estado: string;
  rol?: string;
}

export interface DepartamentoLegacy {
  id: number;
  numero: string;
  piso: number;
  torre: string;
  area_m2: number;
  habitaciones: number;
  banos: number;
  balcon: boolean;
  parqueadero: boolean;
  precio_renta: number;
  estado: string;
}

export interface Contrato {
  fecha_ingreso: string;
  fecha_salida?: string;
  tipo_contrato: string;
  deposito: number;
}

export interface ContactoEmergencia {
  nombre?: string;
  telefono?: string;
}

export interface ResidenteCompletoLegacy {
  id: number;
  usuario: UsuarioLegacy;
  departamento: DepartamentoLegacy;
  contrato: Contrato;
  contacto_emergencia: ContactoEmergencia;
  es_principal: boolean;
  activo: boolean;
  tiempo_residencia: string;
  creado_en: string;
}

// Tipo legacy para compatibilidad
export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  numero_documento: string;
  imagen_perfil?: string;
  rol_id?: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ResidenteStats {
  totalResidentes: number;
  activosHoy: number;
  nuevosEsteMes: number;
  ocupacionPromedio: number;
}

export interface DepartamentoOcupacion {
  piso: number;
  departamento: string;
  ocupado: boolean;
  tipoResidente: 'Propietario' | 'Inquilino' | 'Temporal';
  fechaIngreso: string;
}

export interface ResidenciaData {
  mes: string;
  nuevosResidentes: number;
  bajas: number;
  activos: number;
}
