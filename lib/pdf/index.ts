// ===============================================
// 📄 EXPORTADOR MODULAR DE PDFs - HABITECH
// ===============================================

// Exportar utilidades base
export * from './pdf-base';

// Exportar generadores específicos
export { generarPDFResidenteIndividual } from './pdf-residente';
export { generarPDFTablaResidentes } from './pdf-tabla-residentes';  
export { generarPDFDepartamento, type DepartamentoParaPDF } from './pdf-departamento';
export { generarPDFTablaDepartamentos } from './pdf-tabla-departamentos';
export { generarFacturaPDF, previewFacturaPDF, descargarFacturaPDF, type PagoParaFactura } from './pdf-factura';
export { 
  generarPDFTablaAccesos, 
  generarPDFAccesosPreview, 
  descargarPDFAccesos, 
  type RegistroAccesoParaPDF 
} from './pdf-tabla-accesos';

// ===============================================
// 🔧 FUNCIONES DE CONVENIENCIA
// ===============================================

/**
 * Función principal para generar cualquier tipo de PDF
 */
export const generarPDF = {
  /**
   * Generar certificado individual de residente con preview
   */
  residente: async (residente: any, nombreArchivo?: string) => {
    const { generarPDFResidenteIndividual } = await import('../pdf-utils');
    return generarPDFResidenteIndividual(residente);
  },

  /**
   * Generar tabla completa de residentes con preview
   */
  tablaResidentes: async (residentes: any[], nombreArchivo?: string) => {
    const { generarPDFTablaResidentesPreview } = await import('../pdf-utils');
    return generarPDFTablaResidentesPreview(residentes, nombreArchivo);
  },

  /**
   * Generar certificado de departamento con preview
   */
  departamento: async (departamento: any, nombreArchivo?: string) => {
    const { generarPDFDepartamentoPreview } = await import('../pdf-utils');
    return generarPDFDepartamentoPreview(departamento, nombreArchivo);
  },

  /**
   * Generar tabla completa de departamentos con preview
   */
  tablaDepartamentos: async (departamentos: any[], nombreArchivo?: string) => {
    const { generarPDFTablaDepartamentosPreview } = await import('../pdf-utils');
    return generarPDFTablaDepartamentosPreview(departamentos, nombreArchivo);
  }
};

// ===============================================
// 📊 METADATOS DEL SISTEMA PDF
// ===============================================

export const PDF_METADATA = {
  version: '2.0.0',
  sistema: 'HabiTech PDF Generator',
  autor: 'HabiTech Platform',
  descripcion: 'Sistema modular de generación de PDFs corporativos',
  
  // Tipos de documentos disponibles
  tiposDisponibles: [
    {
      tipo: 'residente',
      descripcion: 'Certificado individual de residente',
      formato: 'portrait',
      uso: 'Certificaciones individuales, cartas de residencia'
    },
    {
      tipo: 'tabla-residentes',
      descripcion: 'Reporte completo de residentes',
      formato: 'landscape', 
      uso: 'Reportes administrativos, listados completos'
    },
    {
      tipo: 'departamento',
      descripcion: 'Certificado de departamento',
      formato: 'portrait',
      uso: 'Información de unidades, certificados de propiedad'
    }
  ],

  // Configuraciones por defecto
  configuraciones: {
    formato: 'A4',
    margen: 15,
    fuente: 'Inter',
    coloresCorporativos: {
      primario: '#0D2042',
      acento: '#D9A441', 
      éxito: '#4CAF50',
      error: '#F44336'
    }
  }
} as const;