// ===============================================
// 🏠 PDF CERTIFICADOS DE DEPARTAMENTOS
// ===============================================

import { 
  COLORES_CORPORATIVOS, 
  FUENTES,
  crearHeaderCorporativo,
  crearFooterCorporativo,
  formatearFecha,
  cargarFavicon,
  generarCodigoUnico
} from './pdf-base';

export interface DepartamentoParaPDF {
  id: number;
  numero: string;
  piso?: number;
  // Campos reales de la base de datos
  area_m2?: string;
  renta_mensual?: string;
  mantenimiento_mensual?: string;
  creado_en?: string;
  // Campos antiguos por compatibilidad
  tamaño?: number;
  precio_renta?: number;
  fecha_creacion?: string;
  // Otros campos
  estado?: string;
  descripcion?: string;
  activo?: boolean;
  residentes?: Array<{
    id: number;
    usuario?: {
      nombre?: string;
      apellido?: string;
      correo?: string;
      numero_documento?: string;
    };
    tipo_relacion: string;
    es_principal: boolean;
    fecha_ingreso: string;
    activo: boolean;
  }>;
}

export const generarPDFDepartamento = async (
  departamento: DepartamentoParaPDF, 
  nombreArchivo: string = `departamento-${departamento.numero}-habitech.pdf`
) => {
  try {
    // Dynamic imports
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const { primaryBlue, accentGold, white, lightGray, darkGray, successGreen, errorRed } = COLORES_CORPORATIVOS;
    
    // ========= HEADER CORPORATIVO =========
    let currentY = await crearHeaderCorporativo(
      doc, 
      'CERTIFICADO DE DEPARTAMENTO',
      `Unidad Residencial Nº ${departamento.numero}`
    );
    
    // Código único del certificado
    const codigoCertificado = generarCodigoUnico('DEPTO', departamento.id);
    doc.setTextColor(...white);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(9);
    doc.text(`Código: ${codigoCertificado}`, pageWidth - 80, 45);
    
    currentY += 15;
    
    // ========= INFORMACIÓN PRINCIPAL DEL DEPARTAMENTO =========
    const boxHeight = 60;
    
    // Caja principal con degradado
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...primaryBlue);
    doc.setLineWidth(2);
    doc.rect(20, currentY, pageWidth - 40, boxHeight, 'FD');
    
    // Número del departamento destacado
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.titulo.family, 'bold');
    doc.setFontSize(36);
    doc.text(departamento.numero, 30, currentY + 25);
    
    // Información básica del departamento (corregir nombres de campos)
    const infoBasica = [
      { label: 'Piso:', valor: departamento.piso?.toString() || 'N/A' },
      { label: 'Tamaño:', valor: departamento.area_m2 ? `${departamento.area_m2} m²` : 'N/A' },
      { label: 'Renta:', valor: departamento.renta_mensual ? `$${parseFloat(departamento.renta_mensual).toLocaleString('es-CO')}` : 'N/A' },
      { label: 'Estado:', valor: departamento.estado || 'No definido' }
    ];
    
    infoBasica.forEach((info, index) => {
      const x = 90;
      const y = currentY + 15 + (index * 8);
      
      // Etiqueta
      doc.setTextColor(...darkGray);
      doc.setFont(FUENTES.etiqueta.family, 'bold');
      doc.setFontSize(10);
      doc.text(info.label, x, y);
      
      // Valor
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.texto.family, 'normal');
      doc.setFontSize(10);
      doc.text(info.valor, x + 30, y);
    });
    
    // Estado visual del departamento
    const estadoColor = departamento.activo !== false ? successGreen : errorRed;
    const estadoTexto = departamento.activo !== false ? 'ACTIVO' : 'INACTIVO';
    
    doc.setFillColor(...(estadoColor as [number, number, number]));
    doc.roundedRect(pageWidth - 80, currentY + 10, 50, 15, 3, 3, 'F');
    doc.setTextColor(...white);
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(8);
    doc.text(estadoTexto, pageWidth - 75, currentY + 20);
    
    currentY += boxHeight + 20;
    
    // ========= DESCRIPCIÓN DEL DEPARTAMENTO =========
    if (departamento.descripcion) {
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.subtitulo.family, 'bold');
      doc.setFontSize(14);
      doc.text('DESCRIPCIÓN', 20, currentY);
      
      currentY += 10;
      
      doc.setFillColor(...lightGray);
      doc.rect(20, currentY, pageWidth - 40, 25, 'F');
      
      doc.setTextColor(...darkGray);
      doc.setFont(FUENTES.texto.family, 'normal');
      doc.setFontSize(10);
      
      const descripcionLineas = doc.splitTextToSize(departamento.descripcion, pageWidth - 50);
      doc.text(descripcionLineas, 25, currentY + 8);
      
      currentY += 35;
    }
    
    // ========= RESIDENTES DEL DEPARTAMENTO =========
    if (departamento.residentes && departamento.residentes.length > 0) {
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.subtitulo.family, 'bold');
      doc.setFontSize(14);
      doc.text(`RESIDENTES (${departamento.residentes.length})`, 20, currentY);
      
      currentY += 10;
      
      // Preparar datos de residentes para tabla
      const residentesData = departamento.residentes.map((residente, index) => {
        const nombreCompleto = residente.usuario?.nombre && residente.usuario?.apellido 
          ? `${residente.usuario.nombre} ${residente.usuario.apellido}` 
          : 'Sin nombre';
          
        const documento = residente.usuario?.numero_documento || 'Sin documento';
        const fechaIngreso = formatearFecha(residente.fecha_ingreso);
        const principal = residente.es_principal ? 'Principal' : 'Residente';
        const estado = residente.activo ? 'Activo' : 'Inactivo';
        
        return [
          (index + 1).toString(),
          nombreCompleto,
          documento,
          residente.tipo_relacion,
          principal,
          fechaIngreso,
          estado
        ];
      });
      
      // Tabla de residentes
      autoTable(doc, {
        head: [['#', 'Nombre Completo', 'Documento', 'Relación', 'Tipo', 'F. Ingreso', 'Estado']],
        body: residentesData,
        startY: currentY,
        theme: 'striped',
        
        headStyles: {
          fillColor: [...primaryBlue] as [number, number, number],
          textColor: [...white] as [number, number, number],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [60, 60, 60]
        },
        
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 45, halign: 'left' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'left' },
          4: { cellWidth: 30, halign: 'center' },
          5: { cellWidth: 25, halign: 'center' },
          6: { cellWidth: 25, halign: 'center' }
        },
        
        margin: { left: 20, right: 20 },
        
        didParseCell: (data) => {
          // Colorear estados
          if (data.column.index === 6) { // Columna Estado
            if (data.cell.text[0]?.includes('Activo')) {
              data.cell.styles.textColor = [...successGreen] as [number, number, number];
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.text[0]?.includes('Inactivo')) {
              data.cell.styles.textColor = [...errorRed] as [number, number, number];
              data.cell.styles.fontStyle = 'bold';
            }
          }
          
          // Colorear principales
          if (data.column.index === 4) { // Columna Tipo
            if (data.cell.text[0]?.includes('Principal')) {
              data.cell.styles.textColor = [255, 193, 7]; // Dorado
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      // Sin residentes
      doc.setFillColor(255, 248, 225); // Amarillo claro
      doc.setDrawColor(...accentGold);
      doc.rect(20, currentY, pageWidth - 40, 25, 'FD');
      
      doc.setTextColor(...darkGray);
      doc.setFont(FUENTES.texto.family, 'italic');
      doc.setFontSize(12);
      doc.text('Este departamento no tiene residentes registrados', pageWidth / 2, currentY + 15, { align: 'center' });
      
      currentY += 35;
    }
    
    // ========= INFORMACIÓN ADICIONAL =========
    if (currentY < pageHeight - 80) {
      // Sección de notas
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.subtitulo.family, 'bold');
      doc.setFontSize(12);
      doc.text('INFORMACIÓN ADICIONAL', 20, currentY);
      
      currentY += 10;
      
      const infoAdicional = [
        `• Fecha de registro: ${departamento.fecha_creacion ? formatearFecha(departamento.fecha_creacion) : 'No disponible'}`,
        `• Código interno: ${departamento.id}`,
        `• Documento generado: ${new Date().toLocaleString('es-ES')}`,
        `• Este certificado es válido para propósitos administrativos`
      ];
      
      doc.setTextColor(...darkGray);
      doc.setFont(FUENTES.texto.family, 'normal');
      doc.setFontSize(9);
      
      infoAdicional.forEach((info, index) => {
        doc.text(info, 25, currentY + (index * 6));
      });
    }
    
    // ========= FOOTER CORPORATIVO =========
    crearFooterCorporativo(doc, codigoCertificado);
    
    // ========= RETORNO DEL PDF =========
    return {
      pdfBlob: doc.output('blob'),
      nombreArchivo: nombreArchivo,
      doc: doc, // Para vista previa si se necesita
      success: true,
      message: `Certificado generado para departamento ${departamento.numero}`,
      codigoCertificado
    };
    
  } catch (error) {
    console.error('Error al generar PDF de departamento:', error);
    throw new Error('No se pudo generar el certificado del departamento');
  }
};