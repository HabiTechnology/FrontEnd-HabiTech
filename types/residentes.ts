export interface Residente {
  id_residente: number;
  id_persona: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  tipo: 'Residente' | 'Visitante' | 'Personal';
  departamento?: string;
  piso?: number;
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  fechaRegistro: string;
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
