export interface Usuario {
  id: number;
  correo: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  numero_documento: string;
  imagen_perfil?: string;
  rol_id?: number;
  activo: boolean;
  creado_en: string;
  actualizado_en?: string;
}

export interface UsuarioFormData {
  correo: string;
  hash_contrasena: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  numero_documento: string;
  imagen_perfil?: string;
  rol_id?: number;
}