// ===============================================
// 📄 EXPORTADOR PRINCIPAL DE PDFs - HABITECH
// ===============================================
//
// Este archivo mantiene retrocompatibilidad mientras 
// redirige a los nuevos módulos PDF organizados
//

// Re-exportar todo desde el nuevo sistema modular
export * from './pdf';

// Mantener alias por compatibilidad
export { generarPDF } from './pdf';
export type { ResidenteParaPDF } from './pdf/pdf-base';
export type { DepartamentoParaPDF } from './pdf/pdf-departamento';

// ===============================================
// 🔄 FUNCIONES DE RETROCOMPATIBILIDAD
// ===============================================

// Para mantener compatibilidad con código existente - ahora con preview
export const generarPDFTablaCompleta = async (residentes: any[], nombreArchivo?: string) => {
  return generarPDFTablaResidentesPreview(residentes, nombreArchivo);
};

export const generarPDFResidenteIndividualCompat = async (residente: any) => {
  const { generarPDFResidenteIndividual } = await import('./pdf/pdf-residente');
  return generarPDFResidenteIndividual(residente);
};

// ===============================================
// 🖼️ FUNCIONES PARA PREVIEW DE PDFs
// ===============================================

/**
 * Genera y muestra preview del PDF de residente individual
 * Abre el PDF en una nueva pestaña para visualización antes de descarga
 */
export const generarPDFResidenteIndividual = async (residente: any) => {
  try {
    const { generarPDFResidenteIndividual: generarPDFOriginal } = await import('./pdf/pdf-residente');
    const resultado = await generarPDFOriginal(residente);
    
    // Crear URL del blob para preview
    const pdfUrl = URL.createObjectURL(resultado.pdfBlob);
    
    // Abrir en nueva pestaña para preview
    const nuevaVentana = window.open(pdfUrl, '_blank');
    
    if (nuevaVentana) {
      // Configurar título de la ventana
      nuevaVentana.document.title = resultado.nombreArchivo;
      
      // Limpiar URL cuando se cierre la ventana
      nuevaVentana.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    } else {
      // Fallback: descargar directamente si no se puede abrir popup
      console.warn('No se pudo abrir popup, descargando directamente...');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = resultado.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    }
    
    return resultado;
  } catch (error) {
    console.error('Error generando preview PDF:', error);
    throw error;
  }
};

/**
 * Genera y muestra preview del PDF de tabla de residentes
 * Abre el PDF en una nueva pestaña para visualización antes de descarga
 */
export const generarPDFTablaResidentesPreview = async (residentes: any[], nombreArchivo?: string) => {
  try {
    const { generarPDFTablaResidentes } = await import('./pdf/pdf-tabla-residentes');
    const resultado = await generarPDFTablaResidentes(residentes, nombreArchivo);
    
    // Crear URL del blob para preview
    const pdfUrl = URL.createObjectURL(resultado.pdfBlob);
    
    // Abrir en nueva pestaña para preview
    const nuevaVentana = window.open(pdfUrl, '_blank');
    
    if (nuevaVentana) {
      // Configurar título de la ventana
      nuevaVentana.document.title = resultado.nombreArchivo;
      
      // Limpiar URL cuando se cierre la ventana
      nuevaVentana.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    } else {
      // Fallback: descargar directamente si no se puede abrir popup
      console.warn('No se pudo abrir popup, descargando directamente...');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = resultado.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    }
    
    return resultado;
  } catch (error) {
    console.error('Error generando preview PDF tabla:', error);
    throw error;
  }
};

/**
 * Genera y muestra preview del PDF de departamento
 * Abre el PDF en una nueva pestaña para visualización antes de descarga
 */
export const generarPDFDepartamentoPreview = async (departamento: any, nombreArchivo?: string) => {
  try {
    const { generarPDFDepartamento } = await import('./pdf/pdf-departamento');
    const resultado = await generarPDFDepartamento(departamento, nombreArchivo);
    
    // Crear URL del blob para preview
    const pdfUrl = URL.createObjectURL(resultado.pdfBlob);
    
    // Abrir en nueva pestaña para preview
    const nuevaVentana = window.open(pdfUrl, '_blank');
    
    if (nuevaVentana) {
      // Configurar título de la ventana
      nuevaVentana.document.title = resultado.nombreArchivo;
      
      // Limpiar URL cuando se cierre la ventana
      nuevaVentana.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    } else {
      // Fallback: descargar directamente si no se puede abrir popup
      console.warn('No se pudo abrir popup, descargando directamente...');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = resultado.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    }
    
    return resultado;
  } catch (error) {
    console.error('Error generando preview PDF departamento:', error);
    throw error;
  }
};

/**
 * Genera y muestra preview del PDF de tabla de departamentos
 * Abre el PDF en una nueva pestaña para visualización antes de descarga
 */
export const generarPDFTablaDepartamentosPreview = async (departamentos: any[], nombreArchivo?: string) => {
  try {
    const { generarPDFTablaDepartamentos } = await import('./pdf/pdf-tabla-departamentos');
    const resultado = await generarPDFTablaDepartamentos(departamentos, nombreArchivo);
    
    // Crear URL del blob para preview
    const pdfUrl = URL.createObjectURL(resultado.pdfBlob);
    
    // Abrir en nueva pestaña para preview
    const nuevaVentana = window.open(pdfUrl, '_blank');
    
    if (nuevaVentana) {
      // Configurar título de la ventana
      nuevaVentana.document.title = resultado.nombreArchivo;
      
      // Limpiar URL cuando se cierre la ventana
      nuevaVentana.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    } else {
      // Fallback: descargar directamente si no se puede abrir popup
      console.warn('No se pudo abrir popup, descargando directamente...');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = resultado.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    }
    
    return resultado;
  } catch (error) {
    console.error('Error generando preview PDF tabla departamentos:', error);
    throw error;
  }
};