// ========================================
// 🎯 TIPOS Y UTILIDADES COMUNES PARA PDF
// ========================================

// Tipos para PDF de Residentes
export interface ResidenteParaPDF {
  id: number
  usuario_id: number
  departamento_id: number
  usuario?: {
    nombre?: string
    apellido?: string
    correo?: string
    numero_documento?: string
    telefono?: string | null
    imagen_perfil?: string | null
  }
  departamento?: {
    numero?: string
    piso?: number
    dormitorios?: number
    banos?: number
    area_m2?: number | null
    renta_mensual?: number
    estado?: string
  }
  tipo_relacion: string
  es_principal: boolean
  activo: boolean
  fecha_ingreso: string
  fecha_salida?: string | null
  nombre_contacto_emergencia?: string | null
  telefono_contacto_emergencia?: string | null
  creado_en?: string
}

// Tipos para PDF de Departamentos
export interface DepartamentoParaPDF {
  id: number
  numero: string
  piso: number
  metros_cuadrados?: number
  dormitorios?: number
  banos?: number
  tipo: string
  precio_renta?: number
  precio_compra?: number
  estado: string
  descripcion?: string
  amenidades?: string[]
  imagen_url?: string
  fecha_disponibilidad?: string
  notas_admin?: string
  residentes?: ResidenteParaPDF[]
}

// Colores corporativos elegantes
export const COLORES_CORPORATIVOS = {
  primaryBlue: [13, 32, 66] as const,     // #0D2042 - Azul corporativo
  accentGold: [217, 164, 65] as const,    // #D9A441 - Dorado premium
  lightGray: [245, 245, 245] as const,    // #F5F5F5 - Gris muy suave
  darkGray: [51, 51, 51] as const,        // #333333 - Gris oscuro
  white: [255, 255, 255] as const,        // #FFFFFF - Blanco puro
  successGreen: [76, 175, 80] as const,   // #4CAF50 - Verde éxito
  errorRed: [244, 67, 54] as const,       // #F44336 - Rojo error
  warningOrange: [255, 152, 0] as const   // #FF9800 - Naranja advertencia
};

// Configuración de fuentes
export const FUENTES = {
  titulo: { family: 'helvetica', style: 'bold' as const, size: 22 },
  subtitulo: { family: 'helvetica', style: 'normal' as const, size: 14 },
  seccion: { family: 'helvetica', style: 'bold' as const, size: 14 },
  etiqueta: { family: 'helvetica', style: 'bold' as const, size: 8 },
  texto: { family: 'helvetica', style: 'normal' as const, size: 10 },
  pequeno: { family: 'helvetica', style: 'normal' as const, size: 8 }
};

// Función para cargar favicon/logo
export const cargarFavicon = async (): Promise<string | null> => {
  try {
    const response = await fetch('/favicon.ico');
    if (!response.ok) return null;
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Función para crear header corporativo
export const crearHeaderCorporativo = async (doc: any, titulo: string, subtitulo?: string) => {
  const { primaryBlue, accentGold, white } = COLORES_CORPORATIVOS;
  const pageWidth = doc.internal.pageSize.width;
  
  // Fondo azul corporativo principal
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  // Líneas decorativas doradas
  doc.setFillColor(...accentGold);
  doc.rect(0, 0, pageWidth, 3, 'F');
  doc.rect(0, 52, pageWidth, 3, 'F');
  
  // Título principal
  doc.setTextColor(...white);
  doc.setFont(FUENTES.titulo.family, FUENTES.titulo.style);
  doc.setFontSize(FUENTES.titulo.size);
  doc.text(titulo, 20, 25);
  
  // Subtítulo si se proporciona
  if (subtitulo) {
    doc.setTextColor(...accentGold);
    doc.setFont(FUENTES.subtitulo.family, FUENTES.subtitulo.style);
    doc.setFontSize(10);
    doc.text(subtitulo, 20, 33);
  }
  
  // Fecha y numeración
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.setTextColor(...accentGold);
  doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
  doc.setFontSize(9);
  doc.text(`Emitido el ${fechaActual}`, 20, 48);
  
  return 65; // Retorna la posición Y donde continuar
};

// Función para crear footer corporativo
export const crearFooterCorporativo = (doc: any, codigoVerificacion?: string) => {
  const { primaryBlue, accentGold, white } = COLORES_CORPORATIVOS;
  const pageHeight = doc.internal.pageSize.height;
  const currentY = pageHeight - 35;
  
  // Fondo azul del footer
  doc.setFillColor(...primaryBlue);
  doc.rect(0, currentY, doc.internal.pageSize.width, 35, 'F');
  
  // Línea decorativa dorada
  doc.setFillColor(...accentGold);
  doc.rect(0, currentY, doc.internal.pageSize.width, 2, 'F');
  
  // Información de la empresa
  doc.setTextColor(...white);
  doc.setFont(FUENTES.etiqueta.family, 'bold');
  doc.setFontSize(12);
  doc.text('HABITECH RESIDENTIAL SOLUTIONS', 20, currentY + 12);
  
  doc.setTextColor(...accentGold);
  doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
  doc.setFontSize(9);
  doc.text('Sistema de Gestión Residencial Inteligente', 20, currentY + 18);
  doc.text('www.habitech.com | contacto@habitech.com | +1 (555) 123-4567', 20, currentY + 24);
  
  // Código de verificación si se proporciona
  if (codigoVerificacion) {
    doc.setTextColor(...white);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(8);
    doc.text(`Código: ${codigoVerificacion}`, 120, currentY + 30);
  }
  
  doc.setTextColor(...accentGold);
  doc.text('Documento generado automáticamente', 20, currentY + 30);
};

// Función para crear caja elegante con contenido
export const crearCajaElegante = (
  doc: any, 
  x: number, 
  y: number, 
  width: number, 
  height: number,
  titulo?: string
) => {
  const { primaryBlue, lightGray, accentGold } = COLORES_CORPORATIVOS;
  
  // Caja principal
  doc.setFillColor(...lightGray);
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, height, 'FD');
  
  // Borde interno decorativo
  doc.setDrawColor(...accentGold);
  doc.setLineWidth(0.3);
  doc.rect(x + 3, y + 3, width - 6, height - 6, 'D');
  
  // Título si se proporciona
  if (titulo) {
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.seccion.family, FUENTES.seccion.style);
    doc.setFontSize(FUENTES.seccion.size);
    doc.text(titulo, x + 10, y + 15);
    
    // Línea decorativa bajo el título
    doc.setDrawColor(...accentGold);
    doc.setLineWidth(1.5);
    doc.line(x + 10, y + 17, x + width - 10, y + 17);
  }
};

// Función para formatear fecha elegante
export const formatearFecha = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para formatear moneda
export const formatearMoneda = (cantidad: number): string => {
  return `$${cantidad.toLocaleString('es-ES')}`;
};

// Función para generar código único
export const generarCodigoUnico = (prefijo: string, id: number): string => {
  return `${prefijo}-${String(id).padStart(6, '0')}-${Date.now().toString().slice(-6)}`;
};