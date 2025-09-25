// ===============================================
// 🏠 PDF TABLA COMPLETA DE DEPARTAMENTOS
// ===============================================

import { 
  COLORES_CORPORATIVOS, 
  FUENTES,
  crearHeaderCorporativo,
  crearFooterCorporativo,
  formatearFecha,
  formatearMoneda,
  generarCodigoUnico
} from './pdf-base';

export const generarPDFTablaDepartamentos = async (
  departamentos: any[], 
  nombreArchivo: string = 'departamentos-habitech.pdf'
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
      'REPORTE DE DEPARTAMENTOS',
      `Total: ${departamentos.length} departamentos registrados`
    );
    
    // Estadísticas rápidas en el header
    const ocupados = departamentos.filter(d => d.estado === 'ocupado').length;
    const disponibles = departamentos.filter(d => d.estado === 'disponible').length;
    
    doc.setTextColor(...white);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(10);
    doc.text(`Ocupados: ${ocupados} | Disponibles: ${disponibles} | ${new Date().toLocaleDateString('es-ES')}`, 
      pageWidth - 150, 45);
    
    currentY += 10;
    
    // ========= PREPARAR DATOS PARA LA TABLA =========
    const tableData = departamentos.map((departamento, index) => {
      // Corregir nombres de campos según la base de datos
      const precio = departamento.renta_mensual ? formatearMoneda(parseFloat(departamento.renta_mensual)) : 'No definido';
      const fechaCreacion = departamento.creado_en ? formatearFecha(departamento.creado_en) : 'N/A';
      const estado = departamento.estado || 'Sin definir';
      const tamaño = departamento.area_m2 ? `${departamento.area_m2}m²` : 'N/A';
      
      return [
        (index + 1).toString(), // Número de fila
        departamento.id.toString(),
        departamento.numero,
        departamento.piso?.toString() || 'N/A',
        tamaño,
        precio,
        estado,
        fechaCreacion
      ];
    });
    
    // ========= CONFIGURAR TABLA =========
    autoTable(doc, {
      head: [['#', 'ID', 'Número', 'Piso', 'Tamaño', 'Precio Renta', 'Estado', 'F. Creación']],
      body: tableData,
      startY: currentY,
      styles: {
        font: FUENTES.texto.family,
        fontSize: 9,
        cellPadding: 4,
        lineColor: [...COLORES_CORPORATIVOS.lightGray],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [...primaryBlue],
        textColor: [...white],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        textColor: [...COLORES_CORPORATIVOS.darkGray]
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Gris muy claro
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // #
        1: { halign: 'center', cellWidth: 20 }, // ID  
        2: { halign: 'center', cellWidth: 25 }, // Número
        3: { halign: 'center', cellWidth: 20 }, // Piso
        4: { halign: 'center', cellWidth: 25 }, // Tamaño
        5: { halign: 'right', cellWidth: 35 },  // Precio
        6: { halign: 'center', cellWidth: 30 }, // Estado
        7: { halign: 'center', cellWidth: 35 }  // Fecha
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Colorear estados
        if (data.column.index === 6 && data.section === 'body') { // Columna Estado
          const estado = data.cell.text[0]?.toLowerCase();
          if (estado === 'ocupado') {
            data.cell.styles.textColor = [...successGreen];
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'disponible') {
            data.cell.styles.textColor = [...primaryBlue];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [...errorRed];
          }
        }
      }
    });
    
    // ========= FOOTER CORPORATIVO =========
    crearFooterCorporativo(doc, generarCodigoUnico('TD', departamentos.length));
    
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
      message: `PDF generado con ${departamentos.length} departamentos`
    };
    
  } catch (error) {
    console.error('Error al generar PDF de tabla departamentos:', error);
    throw new Error('No se pudo generar el PDF de la tabla de departamentos');
  }
};