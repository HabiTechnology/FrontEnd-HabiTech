// ===============================================
// 📊 PDF TABLA COMPLETA DE RESIDENTES
// ===============================================

import { 
  ResidenteParaPDF, 
  COLORES_CORPORATIVOS, 
  FUENTES,
  crearHeaderCorporativo,
  crearFooterCorporativo,
  formatearFecha,
  cargarFavicon,
  generarCodigoUnico
} from './pdf-base';

export const generarPDFTablaResidentes = async (
  residentes: ResidenteParaPDF[], 
  nombreArchivo: string = 'residentes-habitech.pdf'
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
    
    // ========= HEADER CORPORATIVO PARA TABLA =========
    let currentY = await crearHeaderCorporativo(
      doc, 
      'REPORTE DE RESIDENTES',
      `Total: ${residentes.length} residentes registrados`
    );
    
    // Estadísticas rápidas en el header
    const activos = residentes.filter(r => r.activo).length;
    const principales = residentes.filter(r => r.es_principal).length;
    
    doc.setTextColor(...white);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(10);
    doc.text(`Activos: ${activos} | Principales: ${principales} | ${new Date().toLocaleDateString('es-ES')}`, 
      pageWidth - 150, 45);
    
    currentY += 10;
    
    // ========= PREPARAR DATOS PARA LA TABLA =========
    const tableData = residentes.map((residente, index) => {
      const nombreCompleto = residente.usuario?.nombre && residente.usuario?.apellido 
        ? `${residente.usuario.nombre} ${residente.usuario.apellido}` 
        : 'Sin nombre';
        
      const departamento = residente.departamento?.numero || `ID: ${residente.departamento_id}`;
      const fechaIngreso = formatearFecha(residente.fecha_ingreso);
      const estado = residente.activo ? 'Activo' : 'Inactivo';
      const principal = residente.es_principal ? 'Sí' : 'No';
      
      return [
        (index + 1).toString(), // Número de fila
        residente.id.toString(),
        nombreCompleto,
        residente.usuario?.correo || 'Sin email',
        residente.usuario?.numero_documento || 'Sin doc',
        departamento,
        residente.departamento?.piso?.toString() || 'N/A',
        residente.tipo_relacion,
        principal,
        estado,
        fechaIngreso
      ];
    });
    
    // ========= CONFIGURACIÓN DE TABLA ELEGANTE =========
    autoTable(doc, {
      head: [[
        '#', 'ID', 'Nombre Completo', 'Email', 'Documento', 
        'Depto', 'Piso', 'Relación', 'Principal', 'Estado', 'F. Ingreso'
      ]],
      body: tableData,
      startY: currentY,
      theme: 'striped',
      
      // Estilos del header
      headStyles: {
        fillColor: [...primaryBlue] as [number, number, number],
        textColor: [...white] as [number, number, number],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: { top: 4, right: 2, bottom: 4, left: 2 }
      },
      
      // Estilos del cuerpo
      bodyStyles: {
        fontSize: 8,
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        textColor: [60, 60, 60],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      
      // Estilos alternados
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      
      // Anchos de columnas optimizados
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' }, // #
        1: { cellWidth: 15, halign: 'center' }, // ID
        2: { cellWidth: 45, halign: 'left' },   // Nombre
        3: { cellWidth: 50, halign: 'left' },   // Email
        4: { cellWidth: 25, halign: 'center' }, // Documento
        5: { cellWidth: 20, halign: 'center' }, // Depto
        6: { cellWidth: 15, halign: 'center' }, // Piso
        7: { cellWidth: 25, halign: 'left' },   // Relación
        8: { cellWidth: 20, halign: 'center' }, // Principal
        9: { cellWidth: 25, halign: 'center' }, // Estado
        10: { cellWidth: 25, halign: 'center' } // Fecha
      },
      
      // Configuración general
      margin: { top: currentY, right: 15, bottom: 40, left: 15 },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        fontSize: 8
      },
      
      // Callback para colorear filas según estado
      didParseCell: (data) => {
        // Colorear columna de estado
        if (data.column.index === 9) { // Columna Estado
          if (data.cell.text[0]?.includes('Bien')) {
            data.cell.styles.textColor = [...successGreen] as [number, number, number];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.text[0]?.includes('Mal')) {
            data.cell.styles.textColor = [...errorRed] as [number, number, number];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        
        // Colorear columna de principal
        if (data.column.index === 8) { // Columna Principal
          if (data.cell.text[0]?.includes('Sí')) {
            data.cell.styles.textColor = [255, 193, 7]; // Dorado
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // ========= FOOTER CORPORATIVO =========
    crearFooterCorporativo(doc, generarCodigoUnico('RT', residentes.length));
    
    // Información adicional del footer
    doc.setTextColor(...COLORES_CORPORATIVOS.darkGray);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(8);
    doc.text(
      `Página 1 de ${doc.getNumberOfPages()} | Generado: ${new Date().toLocaleString('es-ES')}`, 
      pageWidth - 100, 
      pageHeight - 10
    );
    
    // ========= RETORNO DEL PDF =========
    return {
      pdfBlob: doc.output('blob'),
      nombreArchivo: nombreArchivo,
      doc: doc, // Para vista previa si se necesita
      success: true,
      message: `PDF generado con ${residentes.length} residentes`
    };
    
  } catch (error) {
    console.error('Error al generar PDF de tabla:', error);
    throw new Error('No se pudo generar el PDF de la tabla de residentes');
  }
};