import type { Residente, ResidenteStats, DepartamentoOcupacion, ResidenciaData } from "@/types/residentes";

export const mockResidentes: Residente[] = [
  {
    id_residente: 1,
    id_persona: 101,
    nombre: "Ana María",
    apellidoPaterno: "García",
    apellidoMaterno: "López",
    email: "ana.garcia@email.com",
    telefono: "+52 55 1234 5678",
    tipo: "Residente",
    departamento: "101A",
    piso: 1,
    estado: "Activo",
    fechaRegistro: "2024-01-15"
  },
  {
    id_residente: 2,
    id_persona: 102,
    nombre: "Carlos",
    apellidoPaterno: "Rodríguez",
    apellidoMaterno: "Hernández",
    email: "carlos.rodriguez@email.com",
    telefono: "+52 55 2345 6789",
    tipo: "Residente",
    departamento: "102B",
    piso: 1,
    estado: "Activo",
    fechaRegistro: "2024-02-20"
  },
  {
    id_residente: 3,
    id_persona: 103,
    nombre: "María Elena",
    apellidoPaterno: "Martínez",
    apellidoMaterno: "Silva",
    email: "maria.martinez@email.com",
    telefono: "+52 55 3456 7890",
    tipo: "Residente",
    departamento: "201A",
    piso: 2,
    estado: "Activo",
    fechaRegistro: "2024-01-10"
  },
  {
    id_residente: 4,
    id_persona: 104,
    nombre: "José Luis",
    apellidoPaterno: "Pérez",
    apellidoMaterno: "González",
    email: "jose.perez@email.com",
    telefono: "+52 55 4567 8901",
    tipo: "Residente",
    departamento: "202B",
    piso: 2,
    estado: "Inactivo",
    fechaRegistro: "2023-12-05"
  },
  {
    id_residente: 5,
    id_persona: 105,
    nombre: "Laura",
    apellidoPaterno: "Sánchez",
    apellidoMaterno: "Morales",
    email: "laura.sanchez@email.com",
    telefono: "+52 55 5678 9012",
    tipo: "Residente",
    departamento: "301A",
    piso: 3,
    estado: "Activo",
    fechaRegistro: "2024-03-12"
  },
  {
    id_residente: 6,
    id_persona: 106,
    nombre: "Roberto",
    apellidoPaterno: "Jiménez",
    apellidoMaterno: "Castro",
    email: "roberto.jimenez@email.com",
    telefono: "+52 55 6789 0123",
    tipo: "Residente",
    departamento: "302B",
    piso: 3,
    estado: "Activo",
    fechaRegistro: "2024-02-28"
  },
  {
    id_residente: 7,
    id_persona: 107,
    nombre: "Patricia",
    apellidoPaterno: "Ramírez",
    apellidoMaterno: "Vargas",
    email: "patricia.ramirez@email.com",
    telefono: "+52 55 7890 1234",
    tipo: "Residente",
    departamento: "401A",
    piso: 4,
    estado: "Activo",
    fechaRegistro: "2024-01-08"
  },
  {
    id_residente: 8,
    id_persona: 108,
    nombre: "Miguel Ángel",
    apellidoPaterno: "Torres",
    apellidoMaterno: "Ruiz",
    email: "miguel.torres@email.com",
    telefono: "+52 55 8901 2345",
    tipo: "Residente",
    departamento: "402B",
    piso: 4,
    estado: "Suspendido",
    fechaRegistro: "2023-11-20"
  }
];

export const mockResidenteStats: ResidenteStats = {
  totalResidentes: 8,
  activosHoy: 6,
  nuevosEsteMes: 2,
  ocupacionPromedio: 85
};

export const mockDepartamentosOcupacion: DepartamentoOcupacion[] = [
  { piso: 1, departamento: "101A", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2024-01-15" },
  { piso: 1, departamento: "101B", ocupado: false, tipoResidente: "Propietario", fechaIngreso: "" },
  { piso: 1, departamento: "102A", ocupado: false, tipoResidente: "Inquilino", fechaIngreso: "" },
  { piso: 1, departamento: "102B", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2024-02-20" },
  { piso: 2, departamento: "201A", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2024-01-10" },
  { piso: 2, departamento: "201B", ocupado: false, tipoResidente: "Inquilino", fechaIngreso: "" },
  { piso: 2, departamento: "202A", ocupado: false, tipoResidente: "Temporal", fechaIngreso: "" },
  { piso: 2, departamento: "202B", ocupado: true, tipoResidente: "Inquilino", fechaIngreso: "2023-12-05" },
  { piso: 3, departamento: "301A", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2024-03-12" },
  { piso: 3, departamento: "301B", ocupado: false, tipoResidente: "Propietario", fechaIngreso: "" },
  { piso: 3, departamento: "302A", ocupado: false, tipoResidente: "Inquilino", fechaIngreso: "" },
  { piso: 3, departamento: "302B", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2024-02-28" },
  { piso: 4, departamento: "401A", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2024-01-08" },
  { piso: 4, departamento: "401B", ocupado: false, tipoResidente: "Temporal", fechaIngreso: "" },
  { piso: 4, departamento: "402A", ocupado: false, tipoResidente: "Inquilino", fechaIngreso: "" },
  { piso: 4, departamento: "402B", ocupado: true, tipoResidente: "Propietario", fechaIngreso: "2023-11-20" },
];

export const mockResidenciaData: ResidenciaData[] = [
  { mes: "Ene", nuevosResidentes: 2, bajas: 0, activos: 2 },
  { mes: "Feb", nuevosResidentes: 3, bajas: 0, activos: 5 },
  { mes: "Mar", nuevosResidentes: 1, bajas: 1, activos: 5 },
  { mes: "Abr", nuevosResidentes: 0, bajas: 0, activos: 5 },
  { mes: "May", nuevosResidentes: 2, bajas: 0, activos: 7 },
  { mes: "Jun", nuevosResidentes: 1, bajas: 1, activos: 7 },
  { mes: "Jul", nuevosResidentes: 0, bajas: 0, activos: 7 },
  { mes: "Ago", nuevosResidentes: 1, bajas: 0, activos: 8 },
  { mes: "Sep", nuevosResidentes: 0, bajas: 0, activos: 8 },
];
