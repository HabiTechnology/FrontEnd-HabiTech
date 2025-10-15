// ===============================================
// 🔐 PDF TABLA DE REGISTROS DE ACCESO
// ===============================================

import { 
  COLORES_CORPORATIVOS, 
  FUENTES,
  crearHeaderCorporativo,
  crearFooterCorporativo,
  generarCodigoUnico
} from './pdf-base';

export interface RegistroAccesoParaPDF {
  id: number;
  usuario_nombre: string;
  usuario_apellido: string;
  departamento_numero: string | null;
  tipo: 'entrada' | 'salida';
  fecha_hora: string;
}

const formatearFechaHora = (fechaStr: string) => {
  const fecha = new Date(fechaStr);
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  
  return {
    fecha: `${dia}/${mes}/${anio}`,
    hora: `${horas}:${minutos}`
  };
};

export const generarPDFTablaAccesos = async (
  registros: RegistroAccesoParaPDF[], 
  nombreArchivo: string = 'registros-acceso-habitech.pdf'
) => {
  try {
    // Dynamic imports
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    // Crear documento landscape para tabla
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const { primaryBlue, white, successGreen, errorRed } = COLORES_CORPORATIVOS;
    
    // ========= HEADER CORPORATIVO SOLO EN PRIMERA PÁGINA =========
    const headerY = await crearHeaderCorporativo(
      doc, 
      'REGISTRO DE ACCESOS AL EDIFICIO',
      `Total: ${registros.length} registros`
    );
    
    // Estadísticas rápidas en el header
    const entradas = registros.filter(r => r.tipo === 'entrada').length;
    const salidas = registros.filter(r => r.tipo === 'salida').length;
    const hoy = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    doc.setTextColor(...white);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(10);
    doc.text(`Entradas: ${entradas} | Salidas: ${salidas} | Generado: ${hoy}`, 
      pageWidth - 180, 45);
    
    const startY = headerY + 10;
    
    // ========= PREPARAR DATOS PARA LA TABLA =========
    const tableData = registros.map((registro, index) => {
      const nombreCompleto = `${registro.usuario_nombre} ${registro.usuario_apellido}`;
      const departamento = registro.departamento_numero || 'N/A';
      const { fecha, hora } = formatearFechaHora(registro.fecha_hora);
      const tipoTexto = registro.tipo === 'entrada' ? 'Entrada' : 'Salida';
      
      return [
        (index + 1).toString(), // Número de fila
        registro.id.toString(),
        nombreCompleto,
        departamento,
        tipoTexto,
        fecha,
        hora
      ];
    });
    
    // ========= CONFIGURACIÓN DE TABLA ELEGANTE =========
    autoTable(doc, {
      head: [[
        '#', 'ID', 'Residente', 'Departamento', 'Tipo', 'Fecha', 'Hora'
      ]],
      body: tableData,
      startY: startY,
      theme: 'striped',
      
      // Estilos del header
      headStyles: {
        fillColor: [...primaryBlue] as [number, number, number],
        textColor: [...white] as [number, number, number],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        cellPadding: { top: 5, right: 3, bottom: 5, left: 3 }
      },
      
      // Estilos del cuerpo
      bodyStyles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        textColor: [60, 60, 60],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      
      // Estilos alternados
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      
      // Anchos de columnas optimizados para landscape
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },  // #
        1: { cellWidth: 20, halign: 'center' },  // ID
        2: { cellWidth: 70, halign: 'left' },    // Residente
        3: { cellWidth: 35, halign: 'center' },  // Departamento
        4: { cellWidth: 35, halign: 'center' },  // Tipo
        5: { cellWidth: 35, halign: 'center' },  // Fecha
        6: { cellWidth: 30, halign: 'center' }   // Hora
      },
      
      // Configuración general - margen superior pequeño en páginas adicionales
      margin: { top: 15, right: 15, bottom: 40, left: 15 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 9
      },
      
      // Callback para colorear filas según tipo
      didParseCell: (data) => {
        // Colorear columna de tipo
        if (data.column.index === 4) { // Columna Tipo
          if (data.cell.text[0] === 'Entrada') {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald-600
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [209, 250, 229]; // Emerald-100
          } else if (data.cell.text[0] === 'Salida') {
            data.cell.styles.textColor = [225, 29, 72]; // Rose-600
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 228, 230]; // Rose-100
          }
        }
      },
      
      // Footer en todas las páginas
      didDrawPage: (data) => {
        const codigoVerificacion = `ACC-${Date.now().toString().slice(-8)}`;
        crearFooterCorporativo(doc, codigoVerificacion);
      }
    });
    
    // ========= GENERAR Y RETORNAR PDF =========
    const pdfBlob = doc.output('blob');
    const timestamp = Date.now().toString().slice(-6);
    const nombreFinal = nombreArchivo.replace('.pdf', `-${timestamp}.pdf`);
    
    return {
      pdfBlob,
      nombreArchivo: nombreFinal,
      totalPaginas: doc.internal.pages.length - 1
    };
    
  } catch (error) {
    console.error('❌ Error generando PDF de accesos:', error);
    throw new Error(`Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Genera y muestra preview del PDF de registros de acceso
 * Abre el PDF en una nueva pestaña para visualización
 */
export const generarPDFAccesosPreview = async (
  registros: RegistroAccesoParaPDF[], 
  nombreArchivo?: string
) => {
  try {
    const resultado = await generarPDFTablaAccesos(registros, nombreArchivo);
    
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
    console.error('Error generando preview PDF de accesos:', error);
    throw error;
  }
};

/**
 * Descarga directamente el PDF sin preview
 */
export const descargarPDFAccesos = async (
  registros: RegistroAccesoParaPDF[], 
  nombreArchivo?: string
) => {
  try {
    const resultado = await generarPDFTablaAccesos(registros, nombreArchivo);
    
    // Crear enlace temporal y descargar
    const pdfUrl = URL.createObjectURL(resultado.pdfBlob);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = resultado.nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
    
    return resultado;
  } catch (error) {
    console.error('Error descargando PDF de accesos:', error);
    throw error;
  }
};
