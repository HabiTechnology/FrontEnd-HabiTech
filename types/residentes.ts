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
