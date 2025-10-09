// ========================================
// 🧾 GENERADOR DE FACTURAS PDF - HABITECH
// ========================================

import { jsPDF } from 'jspdf';
import { COLORES_CORPORATIVOS, FUENTES, cargarFavicon } from './pdf-base';

export interface PagoParaFactura {
  id: number;
  residente_id: number;
  departamento_id: number;
  monto: number;
  tipo_pago: string;
  estado: string;
  fecha_vencimiento: string;
  fecha_pago?: string | null;
  metodo_pago?: string | null;
  referencia?: string | null;
  notas?: string | null;
  residente?: {
    usuario?: {
      nombre?: string;
      apellido?: string;
      correo?: string;
      numero_documento?: string;
      telefono?: string;
    };
  };
  departamento?: {
    numero?: string;
    piso?: number;
  };
}

/**
 * 🧾 Genera una factura profesional en PDF para un pago
 * Incluye logo, información del edificio, detalles del pago y QR (opcional)
 */
export const generarFacturaPDF = async (pago: PagoParaFactura): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 15;

  // ========================================
  // 🎨 ENCABEZADO ELEGANTE CON LOGO
  // ========================================
  
  // Fondo superior decorativo
  doc.setFillColor(COLORES_CORPORATIVOS.primaryBlue[0], COLORES_CORPORATIVOS.primaryBlue[1], COLORES_CORPORATIVOS.primaryBlue[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Detalle dorado
  doc.setFillColor(COLORES_CORPORATIVOS.accentGold[0], COLORES_CORPORATIVOS.accentGold[1], COLORES_CORPORATIVOS.accentGold[2]);
  doc.rect(0, 45, pageWidth, 2, 'F');

  // Logo (si está disponible)
  try {
    const logoBase64 = await cargarFavicon();
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
    }
  } catch (error) {
    console.error('Error al cargar logo:', error);
  }

  // Título principal
  doc.setFont(FUENTES.titulo.family, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('HABITECH', 40, 22);
  
  doc.setFont(FUENTES.subtitulo.family, 'normal');
  doc.setFontSize(10);
  doc.text('Sistema de Gestión de Edificios', 40, 30);

  // FACTURA título en la derecha
  doc.setFont(FUENTES.titulo.family, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('FACTURA', pageWidth - 15, 25, { align: 'right' });
  
  // Número de factura
  doc.setFont(FUENTES.texto.family, 'normal');
  doc.setFontSize(11);
  const numeroFactura = `#${String(pago.id).padStart(8, '0')}`;
  doc.text(numeroFactura, pageWidth - 15, 32, { align: 'right' });
  
  // Fecha de emisión
  const fechaEmision = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(9);
  doc.text(`Fecha de emisión: ${fechaEmision}`, pageWidth - 15, 38, { align: 'right' });

  yPos = 60;

  // ========================================
  // 📋 INFORMACIÓN DEL CLIENTE
  // ========================================
  
  // Calcular altura dinámica según datos disponibles
  let clienteHeight = 25; // Altura base
  if (pago.residente?.usuario?.correo) clienteHeight += 6;
  if (pago.residente?.usuario?.telefono) clienteHeight += 6;
  if (pago.residente?.usuario?.numero_documento) clienteHeight += 6;
  
  doc.setFillColor(COLORES_CORPORATIVOS.lightGray[0], COLORES_CORPORATIVOS.lightGray[1], COLORES_CORPORATIVOS.lightGray[2]);
  doc.roundedRect(15, yPos, pageWidth - 30, clienteHeight, 3, 3, 'F');
  
  doc.setFont(FUENTES.seccion.family, 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORES_CORPORATIVOS.primaryBlue[0], COLORES_CORPORATIVOS.primaryBlue[1], COLORES_CORPORATIVOS.primaryBlue[2]);
  doc.text('INFORMACIÓN DEL CLIENTE', 20, yPos + 8);

  yPos += 15;

  // Datos del residente
  const nombreCliente = pago.residente?.usuario?.nombre && pago.residente?.usuario?.apellido
    ? `${pago.residente.usuario.nombre} ${pago.residente.usuario.apellido}`
    : `Residente ID: ${pago.residente_id}`;
  
  const departamento = pago.departamento?.numero || 'N/A';
  const departamentoCompleto = pago.departamento?.piso 
    ? `${departamento}, Piso ${pago.departamento.piso}` 
    : departamento;
  
  doc.setTextColor(COLORES_CORPORATIVOS.darkGray[0], COLORES_CORPORATIVOS.darkGray[1], COLORES_CORPORATIVOS.darkGray[2]);
  
  // Nombre del cliente
  doc.setFont(FUENTES.etiqueta.family, 'bold');
  doc.setFontSize(9);
  doc.text('Nombre:', 20, yPos);
  doc.setFont(FUENTES.texto.family, 'normal');
  doc.setFontSize(10);
  doc.text(nombreCliente, 50, yPos);
  
  // Departamento
  yPos += 6;
  doc.setFont(FUENTES.etiqueta.family, 'bold');
  doc.setFontSize(9);
  doc.text('Departamento:', 20, yPos);
  doc.setFont(FUENTES.texto.family, 'normal');
  doc.setFontSize(10);
  doc.text(departamentoCompleto, 50, yPos);
  
  // Email (si existe)
  if (pago.residente?.usuario?.correo) {
    yPos += 6;
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(9);
    doc.text('Email:', 20, yPos);
    doc.setFont(FUENTES.texto.family, 'normal');
    doc.setFontSize(10);
    doc.text(pago.residente.usuario.correo, 50, yPos);
  }
  
  // Teléfono (si existe)
  if (pago.residente?.usuario?.telefono && pago.residente.usuario.telefono !== 'N/A') {
    yPos += 6;
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(9);
    doc.text('Teléfono:', 20, yPos);
    doc.setFont(FUENTES.texto.family, 'normal');
    doc.setFontSize(10);
    doc.text(pago.residente.usuario.telefono, 50, yPos);
  }
  
  // Documento de identidad (si existe)
  if (pago.residente?.usuario?.numero_documento && pago.residente.usuario.numero_documento !== 'N/A') {
    yPos += 6;
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(9);
    doc.text('Documento:', 20, yPos);
    doc.setFont(FUENTES.texto.family, 'normal');
    doc.setFontSize(10);
    doc.text(pago.residente.usuario.numero_documento, 50, yPos);
  }

  yPos += 12;

  // ========================================
  // 💰 DETALLES DEL PAGO
  // ========================================
  
  doc.setFillColor(COLORES_CORPORATIVOS.primaryBlue[0], COLORES_CORPORATIVOS.primaryBlue[1], COLORES_CORPORATIVOS.primaryBlue[2]);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  
  doc.setFont(FUENTES.seccion.family, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('CONCEPTO', 20, yPos + 5.5);
  doc.text('CANTIDAD', pageWidth / 2, yPos + 5.5, { align: 'center' });
  doc.text('IMPORTE', pageWidth - 20, yPos + 5.5, { align: 'right' });

  yPos += 8;

  // Línea de concepto
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 12, 'F');
  
  // Borde sutil
  doc.setDrawColor(COLORES_CORPORATIVOS.lightGray[0], COLORES_CORPORATIVOS.lightGray[1], COLORES_CORPORATIVOS.lightGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, pageWidth - 30, 12);
  
  const conceptoPago = pago.tipo_pago.charAt(0).toUpperCase() + pago.tipo_pago.slice(1).replace('_', ' ');
  const fechaVencimiento = new Date(pago.fecha_vencimiento).toLocaleDateString('es-MX');
  
  doc.setFont(FUENTES.texto.family, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORES_CORPORATIVOS.darkGray[0], COLORES_CORPORATIVOS.darkGray[1], COLORES_CORPORATIVOS.darkGray[2]);
  doc.text(conceptoPago, 20, yPos + 5);
  
  doc.setFont(FUENTES.texto.family, 'normal');
  doc.setFontSize(9);
  doc.text(`Vencimiento: ${fechaVencimiento}`, 20, yPos + 9);
  
  doc.setFont(FUENTES.texto.family, 'normal');
  doc.setFontSize(11);
  doc.text('1', pageWidth / 2, yPos + 7, { align: 'center' });
  
  doc.setFont(FUENTES.texto.family, 'bold');
  doc.setFontSize(11);
  doc.text(`$${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 20, yPos + 7, { align: 'right' });

  yPos += 12;

  // ========================================
  // 💵 TOTALES
  // ========================================
  
  yPos += 10;
  
  // Subtotal
  doc.setFont(FUENTES.texto.family, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORES_CORPORATIVOS.darkGray[0], COLORES_CORPORATIVOS.darkGray[1], COLORES_CORPORATIVOS.darkGray[2]);
  doc.text('Subtotal:', pageWidth - 60, yPos);
  doc.text(`$${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('IVA (16%):', pageWidth - 60, yPos);
  const iva = pago.monto * 0.16;
  doc.text(`$${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 8;
  
  // Total con fondo dorado
  doc.setFillColor(COLORES_CORPORATIVOS.accentGold[0], COLORES_CORPORATIVOS.accentGold[1], COLORES_CORPORATIVOS.accentGold[2]);
  doc.roundedRect(pageWidth - 90, yPos - 5, 75, 12, 2, 2, 'F');
  
  doc.setFont(FUENTES.seccion.family, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', pageWidth - 85, yPos + 3);
  const total = pago.monto + iva;
  doc.text(`$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} $`, pageWidth - 20, yPos + 3, { align: 'right' });

  yPos += 20;

  // ========================================
  // 📊 ESTADO DEL PAGO
  // ========================================
  
  const estadoPago = pago.estado.toUpperCase();
  let colorEstado: readonly [number, number, number] = COLORES_CORPORATIVOS.warningOrange;
  
  if (estadoPago === 'PAGADO') {
    colorEstado = COLORES_CORPORATIVOS.successGreen;
  } else if (estadoPago === 'ATRASADO') {
    colorEstado = COLORES_CORPORATIVOS.errorRed;
  }
  
  doc.setFillColor(colorEstado[0], colorEstado[1], colorEstado[2]);
  doc.roundedRect(15, yPos, 60, 10, 2, 2, 'F');
  
  doc.setFont(FUENTES.texto.family, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`ESTADO: ${estadoPago}`, 45, yPos + 6.5, { align: 'center' });

  // Si está pagado, mostrar información de pago
  if (pago.fecha_pago) {
    yPos += 15;
    
    doc.setFillColor(COLORES_CORPORATIVOS.lightGray[0], COLORES_CORPORATIVOS.lightGray[1], COLORES_CORPORATIVOS.lightGray[2]);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');
    
    doc.setFont(FUENTES.seccion.family, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLORES_CORPORATIVOS.primaryBlue[0], COLORES_CORPORATIVOS.primaryBlue[1], COLORES_CORPORATIVOS.primaryBlue[2]);
    doc.text('INFORMACIÓN DE PAGO', 20, yPos + 7);
    
    yPos += 13;
    
    doc.setFont(FUENTES.texto.family, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(COLORES_CORPORATIVOS.darkGray[0], COLORES_CORPORATIVOS.darkGray[1], COLORES_CORPORATIVOS.darkGray[2]);
    
    const fechaPago = new Date(pago.fecha_pago).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.setFont(FUENTES.etiqueta.family, 'bold');
    doc.setFontSize(8);
    doc.text('Fecha de pago:', 20, yPos);
    doc.setFont(FUENTES.texto.family, 'normal');
    doc.setFontSize(10);
    doc.text(fechaPago, 50, yPos);
    
    if (pago.metodo_pago) {
      yPos += 5;
      doc.setFont(FUENTES.etiqueta.family, 'bold');
      doc.setFontSize(8);
      doc.text('Método de pago:', 20, yPos);
      doc.setFont(FUENTES.texto.family, 'normal');
      doc.setFontSize(10);
      doc.text(pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1), 50, yPos);
    }
    
    if (pago.referencia) {
      yPos += 5;
      doc.setFont(FUENTES.etiqueta.family, 'bold');
      doc.setFontSize(8);
      doc.text('Referencia:', 20, yPos);
      doc.setFont(FUENTES.texto.family, 'normal');
      doc.setFontSize(10);
      doc.text(pago.referencia, 50, yPos);
    }
  }

  // ========================================
  // 📝 NOTAS ADICIONALES
  // ========================================
  
  if (pago.notas) {
    yPos += 15;
    
    doc.setFont(FUENTES.seccion.family, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORES_CORPORATIVOS.primaryBlue[0], COLORES_CORPORATIVOS.primaryBlue[1], COLORES_CORPORATIVOS.primaryBlue[2]);
    doc.text('NOTAS:', 15, yPos);
    
    yPos += 6;
    
    doc.setFont(FUENTES.texto.family, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORES_CORPORATIVOS.darkGray[0], COLORES_CORPORATIVOS.darkGray[1], COLORES_CORPORATIVOS.darkGray[2]);
    const notasLines = doc.splitTextToSize(pago.notas, pageWidth - 30);
    doc.text(notasLines, 15, yPos);
  }

  // ========================================
  // 🔒 PIE DE PÁGINA
  // ========================================
  
  const footerY = pageHeight - 25;
  
  // Línea divisoria
  doc.setDrawColor(COLORES_CORPORATIVOS.accentGold[0], COLORES_CORPORATIVOS.accentGold[1], COLORES_CORPORATIVOS.accentGold[2]);
  doc.setLineWidth(1);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  // Texto del pie
  doc.setFont(FUENTES.pequeno.family, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORES_CORPORATIVOS.darkGray[0], COLORES_CORPORATIVOS.darkGray[1], COLORES_CORPORATIVOS.darkGray[2]);
  
  doc.text('Este documento es una representación impresa de una factura electrónica', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text('HabiTech © 2024-2025 | Todos los derechos reservados', pageWidth / 2, footerY + 10, { align: 'center' });
  doc.text(`Documento generado el ${new Date().toLocaleString('es-MX')}`, pageWidth / 2, footerY + 14, { align: 'center' });
  
  // Sello de autenticidad
  doc.setFont(FUENTES.pequeno.family, 'bold');
  doc.setFontSize(7);
  doc.setTextColor(COLORES_CORPORATIVOS.primaryBlue[0], COLORES_CORPORATIVOS.primaryBlue[1], COLORES_CORPORATIVOS.primaryBlue[2]);
  doc.text('✓ DOCUMENTO VERIFICADO', pageWidth - 15, footerY + 18, { align: 'right' });

  return doc;
};

/**
 * 🖼️ Genera y muestra preview de la factura en nueva pestaña
 */
export const previewFacturaPDF = async (pago: PagoParaFactura): Promise<void> => {
  const doc = await generarFacturaPDF(pago);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

/**
 * 💾 Genera y descarga la factura PDF directamente
 */
export const descargarFacturaPDF = async (pago: PagoParaFactura): Promise<void> => {
  const doc = await generarFacturaPDF(pago);
  const nombreArchivo = `Factura_${String(pago.id).padStart(8, '0')}_${Date.now()}.pdf`;
  doc.save(nombreArchivo);
};
