export interface Residente {
  id_residente: number;
  nombre: string;
  email: string;
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
