export interface Usuario {
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

export interface Departamento {
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

export interface ResidenteCompleto {
  id: number;
  usuario: Usuario;
  departamento: Departamento;
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
