// ===================================================
// 🏆 PDF RESIDENTE INDIVIDUAL - TIPO FACTURA ELEGANTE
// ===================================================

import { 
  ResidenteParaPDF, 
  COLORES_CORPORATIVOS, 
  FUENTES,
  crearHeaderCorporativo,
  crearFooterCorporativo,
  crearCajaElegante,
  formatearFecha,
  formatearMoneda,
  generarCodigoUnico
} from './pdf-base';

export const generarPDFResidenteIndividual = async (residente: ResidenteParaPDF) => {
  try {
    // Dynamic import para jsPDF
    const jsPDF = (await import('jspdf')).default;
    
    // Crear documento PDF tipo factura
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const { primaryBlue, accentGold, lightGray, darkGray, white } = COLORES_CORPORATIVOS;
    
    // ========= HEADER CORPORATIVO ELEGANTE =========
    let currentY = await crearHeaderCorporativo(
      doc, 
      'CERTIFICADO DE RESIDENCIA',
      'RESIDENTIAL CERTIFICATE'
    );
    
    // Número de certificado en el header
    const numeroCertificado = generarCodigoUnico('HC', residente.id);
    doc.setTextColor(...white);
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(11);
    doc.text(`Certificado N°: ${numeroCertificado}`, 60, 42);
    
    currentY += 15;
    
    // ========= INFORMACIÓN PERSONAL DESTACADA =========
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.seccion.family, FUENTES.seccion.style);
    doc.setFontSize(FUENTES.seccion.size);
    doc.text('INFORMACIÓN PERSONAL', 20, currentY);
    
    // Línea decorativa dorada
    doc.setDrawColor(...accentGold);
    doc.setLineWidth(1.5);
    doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
    
    currentY += 15;
    
    // Caja elegante para información personal
    crearCajaElegante(doc, 15, currentY, pageWidth - 30, 85);
    
    currentY += 15;
    
    // ===== NOMBRE DESTACADO CON ESTILO PREMIUM =====
    const nombreCompleto = `${residente.usuario?.nombre || ''} ${residente.usuario?.apellido || ''}`.trim() || 'NOMBRE NO DISPONIBLE';
    
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.titulo.family, FUENTES.titulo.style);
    doc.setFontSize(16);
    doc.text(nombreCompleto.toUpperCase(), 25, currentY);
    
    // Línea decorativa dorada bajo el nombre
    doc.setDrawColor(...accentGold);
    doc.setLineWidth(1);
    doc.line(25, currentY + 2, 25 + Math.min(nombreCompleto.length * 2.8, pageWidth - 50), currentY + 2);
    
    currentY += 15;
    
    // ===== INFORMACIÓN PERSONAL EN GRID ELEGANTE =====
    const infoPersonal = [
      { etiqueta: 'DOCUMENTO DE IDENTIDAD', valor: residente.usuario?.numero_documento || 'NO DISPONIBLE' },
      { etiqueta: 'CORREO ELECTRÓNICO', valor: residente.usuario?.correo || 'NO DISPONIBLE' },
      { etiqueta: 'TELÉFONO DE CONTACTO', valor: residente.usuario?.telefono || 'NO DISPONIBLE' },
      { etiqueta: 'TIPO DE RESIDENCIA', valor: residente.tipo_relacion?.toUpperCase() || 'NO DEFINIDO' },
      { etiqueta: 'RESIDENTE PRINCIPAL', valor: residente.es_principal ? 'SÍ' : 'NO' },
      { etiqueta: 'ESTADO ACTUAL', valor: residente.activo ? 'ACTIVO' : 'INACTIVO' }
    ];
    
    infoPersonal.forEach((info, index) => {
      const fila = Math.floor(index / 2);
      const columna = index % 2;
      const x = columna === 0 ? 25 : (pageWidth / 2 + 10);
      const y = currentY + (fila * 18);
      
      // Etiqueta con estilo corporativo
      doc.setTextColor(...darkGray);
      doc.setFont(FUENTES.etiqueta.family, FUENTES.etiqueta.style);
      doc.setFontSize(FUENTES.etiqueta.size);
      doc.text(info.etiqueta, x, y);
      
      // Valor destacado
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.texto.family, FUENTES.texto.style);
      doc.setFontSize(FUENTES.texto.size);
      doc.text(info.valor, x, y + 6);
      
      // Línea separadora elegante
      doc.setDrawColor(...accentGold);
      doc.setLineWidth(0.2);
      doc.line(x, y + 8, x + 75, y + 8);
    });
    
    currentY += 70;
    
    // ========= INFORMACIÓN DE DEPARTAMENTO =========
    if (residente.departamento) {
      currentY += 10;
      
      // Título de sección departamento
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.seccion.family, FUENTES.seccion.style);
      doc.setFontSize(FUENTES.seccion.size);
      doc.text('INFORMACIÓN DE RESIDENCIA', 20, currentY);
      
      doc.setDrawColor(...accentGold);
      doc.setLineWidth(1.5);
      doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
      
      currentY += 15;
      
      // Caja premium para departamento
      crearCajaElegante(doc, 15, currentY, pageWidth - 30, 60);
      
      currentY += 15;
      
      // Número de departamento con tipografía premium
      const numDepartamento = residente.departamento.numero || 'N/A';
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.titulo.family, FUENTES.titulo.style);
      doc.setFontSize(18);
      doc.text(`DEPARTAMENTO ${numDepartamento}`, 25, currentY);
      
      currentY += 12;
      
      // Grid de información del departamento
      const infoDepartamento = [
        { etiqueta: 'PISO', valor: residente.departamento.piso?.toString() || 'N/A' },
        { etiqueta: 'DORMITORIOS', valor: residente.departamento.dormitorios?.toString() || 'N/A' },
        { etiqueta: 'BAÑOS', valor: residente.departamento.banos?.toString() || 'N/A' },
        { etiqueta: 'ÁREA (M²)', valor: residente.departamento.area_m2?.toString() || 'N/A' },
        { etiqueta: 'RENTA MENSUAL', valor: residente.departamento.renta_mensual ? 
          formatearMoneda(residente.departamento.renta_mensual) : 'N/A' },
        { etiqueta: 'ESTADO', valor: residente.departamento.estado?.toUpperCase() || 'N/A' }
      ];
      
      infoDepartamento.forEach((info, index) => {
        const fila = Math.floor(index / 3);
        const columna = index % 3;
        const x = 25 + (columna * 55);
        const y = currentY + (fila * 18);
        
        // Etiqueta departamento
        doc.setTextColor(...darkGray);
        doc.setFont(FUENTES.etiqueta.family, FUENTES.etiqueta.style);
        doc.setFontSize(7);
        doc.text(info.etiqueta, x, y);
        
        // Valor departamento
        doc.setTextColor(...primaryBlue);
        doc.setFont(FUENTES.texto.family, FUENTES.texto.style);
        doc.setFontSize(9);
        doc.text(info.valor, x, y + 6);
        
        // Línea decorativa
        doc.setDrawColor(...accentGold);
        doc.setLineWidth(0.2);
        doc.line(x, y + 8, x + 50, y + 8);
      });
      
      currentY += 45;
    }
    
    // ========= PERÍODO DE RESIDENCIA =========
    currentY += 15;
    
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.seccion.family, FUENTES.seccion.style);
    doc.setFontSize(12);
    doc.text('PERÍODO DE RESIDENCIA', 20, currentY);
    
    currentY += 10;
    
    const fechaIngreso = formatearFecha(residente.fecha_ingreso);
    
    doc.setTextColor(...darkGray);
    doc.setFont(FUENTES.texto.family, FUENTES.texto.style);
    doc.setFontSize(FUENTES.texto.size);
    doc.text(`Fecha de Ingreso: ${fechaIngreso}`, 25, currentY);
    
    if (residente.fecha_salida) {
      const fechaSalida = formatearFecha(residente.fecha_salida);
      doc.text(`Fecha de Salida: ${fechaSalida}`, 25, currentY + 8);
    } else {
      doc.setTextColor(...COLORES_CORPORATIVOS.successGreen);
      doc.text('Residencia Activa', 25, currentY + 8);
    }
    
    // ========= CONTACTO DE EMERGENCIA =========
    if (residente.nombre_contacto_emergencia) {
      currentY += 25;
      
      doc.setTextColor(...primaryBlue);
      doc.setFont(FUENTES.seccion.family, FUENTES.seccion.style);
      doc.setFontSize(12);
      doc.text('CONTACTO DE EMERGENCIA', 20, currentY);
      
      currentY += 10;
      
      doc.setTextColor(...darkGray);
      doc.setFont(FUENTES.etiqueta.family, 'bold');
      doc.setFontSize(FUENTES.texto.size);
      doc.text(`${residente.nombre_contacto_emergencia}`, 25, currentY);
      
      if (residente.telefono_contacto_emergencia) {
        doc.setFont(FUENTES.texto.family, FUENTES.texto.style);
        doc.text(`Tel: ${residente.telefono_contacto_emergencia}`, 25, currentY + 8);
      }
    }
    
    // ========= CERTIFICACIÓN OFICIAL COMPACTA =========
    currentY += 20; // Espacio desde el último contenido
    
    // Verificar que no nos salgamos de la página
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }
    
    // Caja de certificación más pequeña y elegante
    doc.setFillColor(...lightGray);
    doc.setDrawColor(...primaryBlue);
    doc.setLineWidth(0.5);
    doc.rect(20, currentY, pageWidth - 40, 18, 'FD');
    
    // Sello decorativo más pequeño
    doc.setFillColor(...accentGold);
    doc.circle(28, currentY + 9, 5, 'F');
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(6);
    doc.text('✓', 26, currentY + 11);
    
    // Texto de certificación más compacto
    doc.setTextColor(...primaryBlue);
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(9);
    doc.text('CERTIFICACIÓN OFICIAL HABITECH', 38, currentY + 7);
    
    doc.setTextColor(...darkGray);
    doc.setFont(FUENTES.pequeno.family, FUENTES.pequeno.style);
    doc.setFontSize(7);
    doc.text('Este documento certifica oficialmente la residencia en HabiTech', 38, currentY + 12);
    doc.text('Válido para trámites oficiales y verificación de domicilio', 38, currentY + 16);
    
    // ========= FOOTER CORPORATIVO =========
    crearFooterCorporativo(doc, numeroCertificado);
    
    // ========= RETORNO DEL PDF =========
    const nombreArchivo = `certificado-${nombreCompleto.replace(/\s+/g, '-').toLowerCase()}-${numeroCertificado}.pdf`;
    
    return {
      pdfBlob: doc.output('blob'),
      nombreArchivo: nombreArchivo,
      doc: doc // Para vista previa si se necesita
    };
    
  } catch (error) {
    console.error('Error generando PDF individual:', error);
    throw new Error('No se pudo generar el PDF del residente');
  }
};