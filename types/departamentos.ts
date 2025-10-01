export interface Departamento {
  id: number;
  numero: string;
  piso: number;
  dormitorios: number;
  banos: number;
  area_m2?: number;
  renta_mensual: number;
  mantenimiento_mensual: number;
  estado: 'disponible' | 'ocupado' | 'mantenimiento' | 'no_disponible';
  descripcion?: string;
  servicios?: any; // JSONB field
  imagenes?: any; // JSONB field
  activo: boolean;
  creado_en: string;
}

export interface DepartamentoFormData {
  numero: string;
  piso: number;
  dormitorios: number;
  banos: number;
  area_m2?: number;
  renta_mensual: number;
  mantenimiento_mensual: number;
  estado?: 'disponible' | 'ocupado' | 'mantenimiento' | 'no_disponible';
  descripcion?: string;
  servicios?: any;
  imagenes?: any;
}
