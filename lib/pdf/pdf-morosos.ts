import jsPDF from 'jspdf'
// @ts-ignore - jspdf-autotable types
import autoTable from 'jspdf-autotable'

interface Moroso {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string | null
  departamento_numero: string
  departamento_piso: number
  monto: number
  recargo: number
  total_adeudado: number
  dias_atraso: number
  tipo_pago: string
  descripcion: string
  fecha_vencimiento: string
}

interface Estadisticas {
  total_morosos: number
  total_adeudado: number
  total_recargos: number
  promedio_dias_atraso: number
}

export async function generarPDFMorosos(morosos: Moroso[], estadisticas: Estadisticas) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPos = 20

  // Función para formatear montos
  const formatearMonto = (monto: number) => {
    return `$${monto.toLocaleString('es-MX', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  // Función para formatear fechas
  const formatearFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // ========================================
  // ENCABEZADO PROFESIONAL
  // ========================================
  
  // Fondo azul del header
  doc.setFillColor(37, 99, 235) // Blue-600
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Línea decorativa dorada
  doc.setFillColor(251, 191, 36) // Amber-400
  doc.rect(0, 40, pageWidth, 1.5, 'F')
  
  // Logo y nombre de la empresa
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('HabiTech', 15, 20)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Gestión Residencial', 15, 26)
  doc.text('RFC: HTC123456789', 15, 31)
  
  // Título del reporte (derecha)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE DE DEUDORES MOROSOS', pageWidth - 15, 22, { align: 'right' })
  
  // Fecha de generación
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const fechaActual = new Date().toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Fecha de generación: ${fechaActual}`, pageWidth - 15, 32, { align: 'right' })
  
  yPos = 50

  // ========================================
  // RESUMEN EJECUTIVO
  // ========================================
  
  doc.setFillColor(254, 226, 226) // Red-100
  doc.roundedRect(15, yPos, pageWidth - 30, 32, 2, 2, 'F')
  
  // Borde decorativo
  doc.setDrawColor(220, 38, 38) // Red-600
  doc.setLineWidth(0.5)
  doc.roundedRect(15, yPos, pageWidth - 30, 32, 2, 2, 'S')
  
  yPos += 7
  doc.setTextColor(153, 27, 27) // Red-900
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN EJECUTIVO', 20, yPos)
  
  yPos += 8
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  
  const col1X = 25
  const col2X = pageWidth / 2 + 15
  
  // Columna 1
  doc.setFont('helvetica', 'bold')
  doc.text('Total de Morosos:', col1X, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(220, 38, 38)
  doc.text(estadisticas.total_morosos.toString(), col1X + 45, yPos)
  
  // Columna 2
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Adeudado:', col2X, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(220, 38, 38)
  doc.text(formatearMonto(estadisticas.total_adeudado), col2X + 45, yPos)
  
  yPos += 6
  doc.setTextColor(0, 0, 0)
  
  // Columna 1
  doc.setFont('helvetica', 'bold')
  doc.text('Recargos Totales:', col1X, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(234, 88, 12) // Orange-600
  doc.text(formatearMonto(estadisticas.total_recargos), col1X + 45, yPos)
  
  // Columna 2
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('Promedio Días Atraso:', col2X, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(220, 38, 38)
  doc.text(`${estadisticas.promedio_dias_atraso} días`, col2X + 45, yPos)
  
  yPos += 18

  // ========================================
  // TABLA DE DEUDORES
  // ========================================
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLE DE DEUDORES', 15, yPos)
  
  yPos += 2

  // Preparar datos para la tabla
  const tableData = morosos.map(moroso => {
    let severidad = 'Leve'
    if (moroso.dias_atraso >= 60) severidad = 'Critico'
    else if (moroso.dias_atraso >= 30) severidad = 'Grave'
    else if (moroso.dias_atraso >= 15) severidad = 'Moderado'

    return [
      `${moroso.nombre} ${moroso.apellido}`,
      `#${moroso.departamento_numero}`,
      moroso.tipo_pago,
      formatearMonto(moroso.monto),
      formatearMonto(moroso.recargo || 0),
      formatearMonto(moroso.total_adeudado),
      moroso.dias_atraso.toString(),
      severidad,
      moroso.correo
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Residente', 'Depto', 'Tipo', 'Monto', 'Recargo', 'Total', 'Dias', 'Severidad', 'Email']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [220, 38, 38], // Red-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' }, // Residente
      1: { cellWidth: 15, halign: 'center' }, // Depto
      2: { cellWidth: 22, halign: 'left' }, // Tipo
      3: { cellWidth: 20, halign: 'right' }, // Monto
      4: { cellWidth: 20, halign: 'right' }, // Recargo
      5: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }, // Total
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }, // Días
      7: { cellWidth: 18, halign: 'center' }, // Severidad
      8: { cellWidth: 31, fontSize: 6, halign: 'left' } // Email
    },
    didParseCell: (data) => {
      // Colorear totales en rojo
      if (data.column.index === 5 && data.section === 'body') {
        data.cell.styles.textColor = [220, 38, 38]
      }
      
      // Colorear días de atraso según severidad
      if (data.column.index === 6 && data.section === 'body') {
        const dias = parseInt(data.cell.text[0])
        if (dias >= 60) {
          data.cell.styles.textColor = [220, 38, 38] // Red
        } else if (dias >= 30) {
          data.cell.styles.textColor = [234, 88, 12] // Orange
        } else if (dias >= 15) {
          data.cell.styles.textColor = [234, 179, 8] // Yellow
        }
      }
      
      // Colorear severidad
      if (data.column.index === 7 && data.section === 'body') {
        const severidad = data.cell.text[0]
        if (severidad === 'Critico') {
          data.cell.styles.fillColor = [254, 226, 226] // Red-100
          data.cell.styles.textColor = [153, 27, 27] // Red-900
          data.cell.styles.fontStyle = 'bold'
        } else if (severidad === 'Grave') {
          data.cell.styles.fillColor = [255, 237, 213] // Orange-100
          data.cell.styles.textColor = [124, 45, 18] // Orange-900
          data.cell.styles.fontStyle = 'bold'
        } else if (severidad === 'Moderado') {
          data.cell.styles.fillColor = [254, 249, 195] // Yellow-100
          data.cell.styles.textColor = [113, 63, 18] // Yellow-900
        }
      }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Gray-50
    },
    margin: { left: 15, right: 15 }
  })

  // ========================================
  // PIE DE PÁGINA EN TODAS LAS PÁGINAS
  // ========================================
  
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Línea superior del footer
    doc.setDrawColor(229, 231, 235) // Gray-200
    doc.setLineWidth(0.3)
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20)
    
    // Número de página
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128) // Gray-500
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    )
    
    // Nombre de la empresa
    doc.text(
      'HabiTech - Sistema de Gestión Residencial',
      pageWidth - 15,
      pageHeight - 12,
      { align: 'right' }
    )
    
    // Confidencialidad
    doc.setFontSize(7)
    doc.text(
      'Documento Confidencial',
      15,
      pageHeight - 12
    )
  }

  // ========================================
  // NOTA AL PIE (solo última página)
  // ========================================
  
  const finalY = (doc as any).lastAutoTable.finalY || yPos
  if (finalY < pageHeight - 50) {
    doc.setPage(pageCount)
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'italic')
    
    // Cuadro de advertencia
    const warningY = pageHeight - 45
    doc.setFillColor(254, 243, 199) // Yellow-100
    doc.setDrawColor(251, 191, 36) // Amber-400
    doc.setLineWidth(0.5)
    doc.roundedRect(15, warningY, pageWidth - 30, 20, 2, 2, 'FD')
    
    doc.setTextColor(146, 64, 14) // Amber-900
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('IMPORTANTE:', 20, warningY + 6)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(
      'Este reporte contiene información confidencial sobre deudas pendientes.',
      20,
      warningY + 11
    )
    doc.text(
      'Se recomienda realizar seguimiento inmediato con los deudores con mayor atraso.',
      20,
      warningY + 16
    )
  }

  // Descargar PDF
  const nombreArchivo = `Reporte_Morosos_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}
