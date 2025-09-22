// Tipos para PDF
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

// Función para cargar el favicon como base64
const cargarFavicon = async (): Promise<string | null> => {
  try {
    const response = await fetch('/favicon.ico');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('No se pudo cargar el favicon:', error);
    return null;
  }
}

// Función para generar PDF de toda la tabla
export const generarPDFTablaCompleta = async (residentes: ResidenteParaPDF[], nombreArchivo: string = 'residentes_habitech.pdf') => {
  try {
    // Dynamic import para jsPDF y autoTable
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    // Cargar el favicon
    const faviconBase64 = await cargarFavicon();
    
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape para tablas
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // 🎨 HEADER CON GRADIENTE Y BRANDING
    // Fondo gradiente azul - Header principal
    doc.setFillColor(74, 85, 162); // #4A55A2 - Color primario
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo HabiTech (favicon.ico)
    if (faviconBase64) {
      try {
        // Agregar favicon como imagen
        doc.addImage(faviconBase64, 'ICO', 15, 10, 20, 20);
      } catch (error) {
        console.warn('Error al agregar favicon, usando placeholder:', error);
        // Fallback al logo placeholder
        doc.setFillColor(255, 255, 255);
        doc.circle(25, 20, 12, 'F');
        doc.setTextColor(74, 85, 162);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('H', 20, 25);
      }
    } else {
      // Fallback al logo placeholder si no se pudo cargar el favicon
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 20, 12, 'F');
      doc.setTextColor(74, 85, 162);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('H', 20, 25);
    }
    
    // Título principal - Blanco sobre azul
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('HabiTech', 45, 18);
    
    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Sistema de Gestión Residencial', 45, 28);
    
    // Fecha y hora en la esquina superior derecha
    const fechaHora = new Date().toLocaleString('es-ES');
    doc.setFontSize(10);
    doc.text(`Generado: ${fechaHora}`, pageWidth - 85, 15);
    
    // Total de residentes
    doc.setFontSize(12);
    doc.text(`Total de residentes: ${residentes.length}`, pageWidth - 85, 25);
    
    // 📊 STATISTICS CARDS
    const statsY = 50;
    const cardWidth = 60;
    const cardHeight = 25;
    
    // Card 1: Total
    doc.setFillColor(46, 125, 50); // Verde
    doc.roundedRect(20, statsY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL', 25, statsY + 8);
    doc.setFontSize(16);
    doc.text(residentes.length.toString(), 25, statsY + 18);
    
    // Card 2: Activos
    const activos = residentes.filter(r => r.activo).length;
    doc.setFillColor(67, 160, 71); // Verde claro
    doc.roundedRect(90, statsY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.text('ACTIVOS', 95, statsY + 8);
    doc.setFontSize(16);
    doc.text(activos.toString(), 95, statsY + 18);
    
    // Card 3: Inactivos
    const inactivos = residentes.filter(r => !r.activo).length;
    doc.setFillColor(244, 67, 54); // Rojo
    doc.roundedRect(160, statsY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.text('INACTIVOS', 165, statsY + 8);
    doc.setFontSize(16);
    doc.text(inactivos.toString(), 165, statsY + 18);
    
    // Card 4: Departamentos únicos
    const departamentos = new Set(residentes.map(r => r.departamento?.numero || r.departamento_id));
    doc.setFillColor(255, 152, 0); // Naranja
    doc.roundedRect(230, statsY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.text('DEPTOS', 235, statsY + 8);
    doc.setFontSize(16);
    doc.text(departamentos.size.toString(), 235, statsY + 18);
    
    // 📋 TABLA DE DATOS
    const tablaY = statsY + 35;
    
    // Configuración de la tabla con estilo profesional
    autoTable(doc, {
      startY: tablaY,
      head: [['ID', 'Nombre Completo', 'Email', 'Teléfono', 'Departamento', 'Estado']],
      body: residentes.map(residente => [
        residente.id.toString(),
        residente.usuario?.nombre && residente.usuario?.apellido 
          ? `${residente.usuario.nombre} ${residente.usuario.apellido}`
          : 'No disponible',
        residente.usuario?.correo || 'N/A',
        residente.usuario?.telefono || 'N/A',
        residente.departamento?.numero || residente.departamento_id?.toString() || 'N/A',
        residente.activo ? 'Activo' : 'Inactivo'
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [74, 85, 162], // Color primario HabiTech
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250] // Gris muy claro para filas alternas
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 }, // ID
        1: { halign: 'left', cellWidth: 50 },   // Nombre
        2: { halign: 'left', cellWidth: 65 },   // Email
        3: { halign: 'center', cellWidth: 35 }, // Teléfono
        4: { halign: 'center', cellWidth: 30 }, // Departamento
        5: { 
          halign: 'center', 
          cellWidth: 25,
          cellPadding: 3
        } // Estado
      },
      didParseCell: function(data: any) {
        // Colorear celdas de estado
        if (data.column.index === 5 && data.section === 'body') {
          if (data.cell.text[0] === 'Activo') {
            data.cell.styles.fillColor = [76, 175, 80];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.text[0] === 'Inactivo') {
            data.cell.styles.fillColor = [244, 67, 54];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { top: 10, right: 10, bottom: 25, left: 10 },
      tableWidth: 'auto'
    });
    
    // 📄 FOOTER
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    
    // Línea decorativa
    doc.setDrawColor(74, 85, 162);
    doc.setLineWidth(2);
    doc.line(20, finalY + 15, pageWidth - 20, finalY + 15);
    
    // Footer text
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Este documento fue generado automáticamente por HabiTech', 20, finalY + 25);
    doc.text('Sistema de Gestión Residencial | habitech.com', 20, finalY + 32);
    
    // Página actual en el footer derecho
    doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - 30, finalY + 25);
    
    // Abrir PDF en el navegador para vista previa
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    // Limpiar la URL después de un tiempo para liberar memoria
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta de nuevo.');
  }
}

// Función para generar PDF de un residente individual
export const generarPDFResidenteIndividual = async (residente: ResidenteParaPDF) => {
  try {
    // Dynamic import para jsPDF y autoTable
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    // Cargar el favicon
    const faviconBase64 = await cargarFavicon();
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // 🎨 HEADER ELEGANTE
    // Fondo gradiente
    doc.setFillColor(74, 85, 162);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo HabiTech (favicon.ico)
    if (faviconBase64) {
      try {
        // Agregar favicon como imagen
        doc.addImage(faviconBase64, 'ICO', 15, 10, 25, 25);
      } catch (error) {
        console.warn('Error al agregar favicon, usando placeholder:', error);
        // Fallback al logo placeholder
        doc.setFillColor(255, 255, 255);
        doc.circle(25, 25, 15, 'F');
        doc.setTextColor(74, 85, 162);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('H', 18, 30);
      }
    } else {
      // Fallback al logo placeholder si no se pudo cargar el favicon
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 25, 15, 'F');
      doc.setTextColor(74, 85, 162);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('H', 18, 30);
    }
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('HabiTech', 50, 25);
    
    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Perfil de Residente', 50, 35);
    
    // Fecha
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 50, 42);
    
    // 👤 INFORMACIÓN PERSONAL
    let currentY = 70;
    
    // Título sección
    doc.setFillColor(240, 240, 240);
    doc.rect(20, currentY, pageWidth - 40, 15, 'F');
    doc.setTextColor(74, 85, 162);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('👤 INFORMACIÓN PERSONAL', 25, currentY + 10);
    
    currentY += 25;
    
    // Datos personales en formato de tarjeta
    const datos = [
      { label: 'ID:', valor: `#${residente.id}` },
      { label: 'Nombre:', valor: residente.usuario?.nombre && residente.usuario?.apellido 
        ? `${residente.usuario.nombre} ${residente.usuario.apellido}` 
        : 'No disponible' },
      { label: 'Email:', valor: residente.usuario?.correo || 'No disponible' },
      { label: 'Teléfono:', valor: residente.usuario?.telefono || 'No disponible' },
      { label: 'Documento:', valor: residente.usuario?.numero_documento || 'No disponible' }
    ];
    
    datos.forEach((dato, index) => {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(dato.label, 25, currentY + (index * 12));
      
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(dato.valor, 70, currentY + (index * 12));
    });
    
    currentY += datos.length * 12 + 20;
    
    // 🏠 INFORMACIÓN DE RESIDENCIA
    doc.setFillColor(240, 240, 240);
    doc.rect(20, currentY, pageWidth - 40, 15, 'F');
    doc.setTextColor(74, 85, 162);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('🏠 INFORMACIÓN DE RESIDENCIA', 25, currentY + 10);
    
    currentY += 25;
    
    const datosResidencia = [
      { label: 'Departamento:', valor: residente.departamento?.numero || residente.departamento_id?.toString() || 'No disponible' },
      { label: 'Piso:', valor: residente.departamento?.piso?.toString() || 'No disponible' },
      { label: 'Dormitorios:', valor: residente.departamento?.dormitorios?.toString() || 'No disponible' },
      { label: 'Baños:', valor: residente.departamento?.banos?.toString() || 'No disponible' },
      { label: 'Área (m²):', valor: residente.departamento?.area_m2?.toString() || 'No disponible' },
      { label: 'Renta Mensual:', valor: residente.departamento?.renta_mensual 
        ? `$${residente.departamento.renta_mensual.toLocaleString()}` 
        : 'No disponible' }
    ];
    
    datosResidencia.forEach((dato, index) => {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(dato.label, 25, currentY + (index * 12));
      
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(dato.valor, 80, currentY + (index * 12));
    });
    
    currentY += datosResidencia.length * 12 + 20;
    
    // 📋 ESTADO Y RELACIÓN
    doc.setFillColor(240, 240, 240);
    doc.rect(20, currentY, pageWidth - 40, 15, 'F');
    doc.setTextColor(74, 85, 162);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('📋 ESTADO Y RELACIÓN', 25, currentY + 10);
    
    currentY += 25;
    
    // Estado visual con colores
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Estado:', 25, currentY);
    
    // Color según estado
    if (residente.activo) {
      doc.setFillColor(76, 175, 80);
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(70, currentY - 8, 30, 12, 2, 2, 'F');
      doc.text('✅ ACTIVO', 75, currentY);
    } else {
      doc.setFillColor(244, 67, 54);
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(70, currentY - 8, 35, 12, 2, 2, 'F');
      doc.text('❌ INACTIVO', 75, currentY);
    }
    
    currentY += 20;
    
    const datosRelacion = [
      { label: 'Tipo de Relación:', valor: residente.tipo_relacion.charAt(0).toUpperCase() + residente.tipo_relacion.slice(1) },
      { label: 'Es Principal:', valor: residente.es_principal ? '⭐ Sí' : '👥 No' },
      { label: 'Fecha de Ingreso:', valor: new Date(residente.fecha_ingreso).toLocaleDateString('es-ES') },
      { label: 'Fecha de Salida:', valor: residente.fecha_salida 
        ? new Date(residente.fecha_salida).toLocaleDateString('es-ES') 
        : 'Actualmente residiendo' }
    ];
    
    datosRelacion.forEach((dato, index) => {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(dato.label, 25, currentY + (index * 12));
      
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(dato.valor, 95, currentY + (index * 12));
    });
    
    // 📞 CONTACTO DE EMERGENCIA (si existe)
    if (residente.nombre_contacto_emergencia || residente.telefono_contacto_emergencia) {
      currentY += datosRelacion.length * 12 + 20;
      
      doc.setFillColor(240, 240, 240);
      doc.rect(20, currentY, pageWidth - 40, 15, 'F');
      doc.setTextColor(74, 85, 162);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('📞 CONTACTO DE EMERGENCIA', 25, currentY + 10);
      
      currentY += 25;
      
      if (residente.nombre_contacto_emergencia) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Nombre:', 25, currentY);
        
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(residente.nombre_contacto_emergencia, 70, currentY);
        currentY += 12;
      }
      
      if (residente.telefono_contacto_emergencia) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Teléfono:', 25, currentY);
        
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(residente.telefono_contacto_emergencia, 70, currentY);
      }
    }
    
    // 📄 FOOTER
    const footerY = pageHeight - 30;
    
    // Línea decorativa
    doc.setDrawColor(74, 85, 162);
    doc.setLineWidth(1);
    doc.line(20, footerY, pageWidth - 20, footerY);
    
    // Texto del footer
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('HabiTech - Sistema de Gestión Residencial', 20, footerY + 10);
    doc.text('Documento confidencial - Solo para uso autorizado', 20, footerY + 16);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 60, footerY + 10);
    
    // Abrir PDF en el navegador para vista previa
    const nombreCompleto = residente.usuario?.nombre && residente.usuario?.apellido 
      ? `${residente.usuario.nombre}_${residente.usuario.apellido}`
      : `Residente_${residente.id}`;
    
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    // Limpiar la URL después de un tiempo para liberar memoria
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  } catch (error) {
    console.error('Error al generar PDF individual:', error);
    alert('Error al generar el PDF. Por favor, intenta de nuevo.');
  }
}