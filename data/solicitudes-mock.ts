import type { SolicitudRenta, SolicitudStats, DocumentoAdjunto, ReferenciaContacto } from "@/types/solicitudes";

// Documentos mock para las solicitudes
const documentosElena: DocumentoAdjunto[] = [
  {
    id: "doc1-elena",
    nombre: "INE_Elena_Martinez.pdf",
    tipo: "INE",
    url: "/docs/ine_elena_martinez.pdf",
    fecha_subida: "2024-08-15",
    tamaño: 245000,
    verificado: true
  },
  {
    id: "doc2-elena",
    nombre: "Comprobante_Ingresos_Elena.pdf",
    tipo: "Comprobante_Ingresos",
    url: "/docs/comprobante_ingresos_elena.pdf",
    fecha_subida: "2024-08-15",
    tamaño: 189000,
    verificado: true
  },
  {
    id: "doc3-elena",
    nombre: "Comprobante_Domicilio_Elena.pdf",
    tipo: "Comprobante_Domicilio",
    url: "/docs/comprobante_domicilio_elena.pdf",
    fecha_subida: "2024-08-15",
    tamaño: 156000,
    verificado: false
  }
]

const referenciasElena: ReferenciaContacto[] = [
  {
    id: "ref1-elena",
    nombre: "Ana García López",
    telefono: "+52 55 9999 1111",
    email: "ana.garcia@empresa.com",
    relacion: "Laboral",
    empresa: "Tecnología Digital SA",
    verificado: false,
    comentarios: "Supervisora directa, 3 años trabajando juntas"
  },
  {
    id: "ref2-elena",
    nombre: "Carlos Mendoza",
    telefono: "+52 55 8888 2222",
    relacion: "Personal",
    verificado: false,
    comentarios: "Amigo cercano, conoce su situación financiera"
  }
]

const documentosCarlos: DocumentoAdjunto[] = [
  {
    id: "doc1-carlos",
    nombre: "INE_Carlos_Hernandez.pdf",
    tipo: "INE",
    url: "/docs/ine_carlos_hernandez.pdf",
    fecha_subida: "2024-08-20",
    tamaño: 267000,
    verificado: true
  },
  {
    id: "doc2-carlos",
    nombre: "Estados_Cuenta_Carlos.pdf",
    tipo: "Estados_Cuenta",
    url: "/docs/estados_cuenta_carlos.pdf",
    fecha_subida: "2024-08-20",
    tamaño: 445000,
    verificado: true
  },
  {
    id: "doc3-carlos",
    nombre: "Pre_Aprobacion_Bancaria.pdf",
    tipo: "Otros",
    url: "/docs/pre_aprobacion_carlos.pdf",
    fecha_subida: "2024-08-20",
    tamaño: 123000,
    verificado: true
  }
]

const referenciasCarlos: ReferenciaContacto[] = [
  {
    id: "ref1-carlos",
    nombre: "Banco Santander - Ejecutivo",
    telefono: "+52 55 5555 3333",
    email: "ejecutivo.hipotecario@santander.com",
    relacion: "Bancaria",
    empresa: "Banco Santander",
    verificado: true,
    fecha_verificacion: "2024-08-22",
    comentarios: "Pre-aprobación confirmada por $3,000,000"
  },
  {
    id: "ref2-carlos",
    nombre: "Roberto Pérez - RH",
    telefono: "+52 55 4444 5555",
    email: "rh@constructora-moderna.com",
    relacion: "Laboral",
    empresa: "Constructora Moderna",
    verificado: true,
    fecha_verificacion: "2024-08-21",
    comentarios: "Empleado desde hace 5 años, excelente historial"
  }
]

export const mockSolicitudes: SolicitudRenta[] = [
  {
    id_solicitud: 1,
    nombre: "Elena",
    apellidoPaterno: "Martínez",
    apellidoMaterno: "López",
    email: "elena.martinez@email.com",
    telefono: "+52 55 1111 2222",
    departamento_solicitado: "Cualquiera",
    piso_preferido: 2,
    tipo_solicitud: "Renta",
    estado: "Pendiente",
    fecha_solicitud: "2024-08-15",
    presupuesto_min: 15000,
    presupuesto_max: 20000,
    comentarios: "Busco departamento tranquilo, preferiblemente con vista al parque. Soy profesionista trabajando desde casa.",
    documentos_completos: true,
    documentos_adjuntos: documentosElena,
    referencias_verificadas: false,
    referencias_contactos: referenciasElena,
    score_crediticio: 720
  },
  {
    id_solicitud: 2,
    nombre: "Carlos",
    apellidoPaterno: "Hernández",
    apellidoMaterno: "Ruiz",
    email: "carlos.hernandez@email.com",
    telefono: "+52 55 2222 3333",
    departamento_solicitado: "301A",
    piso_preferido: 3,
    tipo_solicitud: "Compra",
    estado: "En_Revision",
    fecha_solicitud: "2024-08-20",
    presupuesto_min: 2500000,
    presupuesto_max: 3000000,
    comentarios: "Interesado en compra inmediata, tengo pre-aprobación bancaria. Primera vez comprando departamento.",
    documentos_completos: true,
    documentos_adjuntos: documentosCarlos,
    referencias_verificadas: true,
    referencias_contactos: referenciasCarlos,
    score_crediticio: 780
  },
  {
    id_solicitud: 3,
    nombre: "Sofia",
    apellidoPaterno: "García",
    apellidoMaterno: "Mendoza",
    email: "sofia.garcia@email.com",
    telefono: "+52 55 3333 4444",
    departamento_solicitado: "Cualquiera",
    piso_preferido: 1,
    tipo_solicitud: "Temporal",
    estado: "Aprobada",
    fecha_solicitud: "2024-08-10",
    fecha_respuesta: "2024-08-25",
    presupuesto_min: 12000,
    presupuesto_max: 18000,
    comentarios: "Estancia temporal por 6 meses por trabajo. Empresa reconocida con respaldo financiero.",
    documentos_completos: true,
    referencias_verificadas: true,
    score_crediticio: 650
  },
  {
    id_solicitud: 4,
    nombre: "Diego",
    apellidoPaterno: "Morales",
    apellidoMaterno: "Castro",
    email: "diego.morales@email.com",
    telefono: "+52 55 4444 5555",
    departamento_solicitado: "402B",
    piso_preferido: 4,
    tipo_solicitud: "Renta",
    estado: "Rechazada",
    fecha_solicitud: "2024-07-28",
    fecha_respuesta: "2024-08-12",
    presupuesto_min: 25000,
    presupuesto_max: 30000,
    comentarios: "Busco departamento amplio para familia de 4 personas.\n\nRazón de rechazo: Documentos incompletos y referencias no verificadas. Score crediticio insuficiente para el rango de precio solicitado.",
    documentos_completos: false,
    referencias_verificadas: false,
    score_crediticio: 520
  },
  {
    id_solicitud: 5,
    nombre: "Mariana",
    apellidoPaterno: "Vásquez",
    apellidoMaterno: "Jiménez",
    email: "mariana.vasquez@email.com",
    telefono: "+52 55 5555 6666",
    departamento_solicitado: "201B",
    piso_preferido: 2,
    tipo_solicitud: "Renta",
    estado: "Completada",
    fecha_solicitud: "2024-07-15",
    fecha_respuesta: "2024-07-30",
    presupuesto_min: 16000,
    presupuesto_max: 22000,
    comentarios: "Primera vez rentando apartamento. Excelentes referencias laborales y personales.",
    documentos_completos: true,
    referencias_verificadas: true,
    score_crediticio: 690
  },
  {
    id_solicitud: 6,
    nombre: "Fernando",
    apellidoPaterno: "Sánchez",
    apellidoMaterno: "Ramírez",
    email: "fernando.sanchez@email.com",
    telefono: "+52 55 6666 7777",
    departamento_solicitado: "Cualquiera",
    piso_preferido: 3,
    tipo_solicitud: "Renta",
    estado: "Pendiente",
    fecha_solicitud: "2024-08-28",
    presupuesto_min: 18000,
    presupuesto_max: 25000,
    comentarios: "Profesionista joven, referencias laborales disponibles. Trabajo en empresa tecnológica estable.",
    documentos_completos: true,
    referencias_verificadas: false,
    score_crediticio: 710
  },
  {
    id_solicitud: 7,
    nombre: "Andrea",
    apellidoPaterno: "López",
    apellidoMaterno: "Rivera",
    email: "andrea.lopez@email.com",
    telefono: "+52 55 7777 8888",
    departamento_solicitado: "101B",
    piso_preferido: 1,
    tipo_solicitud: "Renta",
    estado: "Pendiente",
    fecha_solicitud: "2024-08-30",
    presupuesto_min: 14000,
    presupuesto_max: 19000,
    comentarios: "Doctora recién graduada, busco mi primer departamento. Tengo aval familiar.",
    documentos_completos: true,
    referencias_verificadas: true,
    score_crediticio: 680
  },
  {
    id_solicitud: 8,
    nombre: "Roberto",
    apellidoPaterno: "Cruz",
    apellidoMaterno: "Moreno",
    email: "roberto.cruz@email.com",
    telefono: "+52 55 8888 9999",
    departamento_solicitado: "Cualquiera",
    piso_preferido: 4,
    tipo_solicitud: "Temporal",
    estado: "En_Revision",
    fecha_solicitud: "2024-08-25",
    presupuesto_min: 20000,
    presupuesto_max: 28000,
    comentarios: "Ejecutivo en reubicación temporal por 1 año. Empresa multinacional como respaldo.",
    documentos_completos: true,
    referencias_verificadas: true,
    score_crediticio: 750
  }
];

export const mockSolicitudStats: SolicitudStats = {
  totalSolicitudes: 8,
  pendientes: 3,
  aprobadas: 1,
  rechazadas: 1,
  completadas: 1
};
