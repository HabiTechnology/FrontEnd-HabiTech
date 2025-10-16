import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      nombre,
      apellido,
      correo,
      departamento,
      tipo_pago,
      monto,
      recargo,
      total_adeudado,
      dias_atraso,
      fecha_vencimiento,
      descripcion
    } = body

    console.log('📧 Enviando recordatorio de pago a:', correo)

    // Formatear montos
    const formatearMonto = (monto: number) => {
      return monto.toLocaleString('es-MX', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    // Formatear fecha
    const formatearFecha = (fecha: string) => {
      return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }

    // Determinar severidad
    let severidad = 'leve'
    let colorSeveridad = '#3b82f6' // blue
    if (dias_atraso >= 60) {
      severidad = 'crítico'
      colorSeveridad = '#dc2626' // red
    } else if (dias_atraso >= 30) {
      severidad = 'grave'
      colorSeveridad = '#ea580c' // orange
    } else if (dias_atraso >= 15) {
      severidad = 'moderado'
      colorSeveridad = '#eab308' // yellow
    }

    // Contenido HTML del email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0 0 0;
      opacity: 0.9;
    }
    .alert-banner {
      background-color: ${colorSeveridad};
      color: white;
      padding: 15px;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      font-weight: 500;
      color: #111827;
    }
    .total-box {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border: 2px solid #dc2626;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: center;
    }
    .total-label {
      font-size: 14px;
      color: #991b1b;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .total-amount {
      font-size: 32px;
      color: #dc2626;
      font-weight: bold;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏢 HabiTech</h1>
      <p>Sistema de Gestión Residencial</p>
    </div>
    
    <div class="alert-banner">
      ⚠️ RECORDATORIO DE PAGO - Nivel ${severidad.toUpperCase()}
    </div>
    
    <div class="content">
      <div class="greeting">
        Estimado/a <strong>${nombre} ${apellido}</strong>,
      </div>
      
      <p>
        Le informamos que tiene un pago <strong>vencido</strong> pendiente correspondiente a su 
        departamento <strong>#${departamento}</strong>.
      </p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Concepto:</span>
          <span class="info-value">${tipo_pago}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Descripción:</span>
          <span class="info-value">${descripcion}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de vencimiento:</span>
          <span class="info-value">${formatearFecha(fecha_vencimiento)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Días de atraso:</span>
          <span class="info-value" style="color: ${colorSeveridad}; font-weight: bold;">
            ${dias_atraso} días
          </span>
        </div>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Monto original:</span>
          <span class="info-value">$${formatearMonto(monto)}</span>
        </div>
        ${recargo > 0 ? `
        <div class="info-row">
          <span class="info-label">Recargo por mora:</span>
          <span class="info-value" style="color: #ea580c;">+$${formatearMonto(recargo)}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="total-box">
        <div class="total-label">TOTAL A PAGAR</div>
        <div class="total-amount">$${formatearMonto(total_adeudado)}</div>
      </div>
      
      ${dias_atraso >= 30 ? `
      <div class="warning-box">
        <strong>⚠️ ATENCIÓN:</strong> Su deuda ha superado los ${dias_atraso} días de atraso.
        Le solicitamos regularizar su situación a la brevedad para evitar acciones legales.
      </div>
      ` : ''}
      
      <p>
        Por favor, regularice su situación lo antes posible. Puede realizar su pago mediante
        los métodos disponibles en nuestro sistema.
      </p>
      
      <p style="text-align: center;">
        <a href="https://habitech.app/financiero" class="button">
          💳 Realizar Pago
        </a>
      </p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Si ya realizó el pago, por favor ignore este mensaje o contáctenos para verificar
        su estado de cuenta.
      </p>
    </div>
    
    <div class="footer">
      <p>
        <strong>HabiTech - Sistema de Gestión Residencial</strong><br>
        Este es un correo automático, por favor no responder.<br>
        Para consultas, contacte a la administración.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Enviar email con Brevo
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: {
          name: 'HabiTech - Gestión Residencial',
          email: process.env.BREVO_FROM_EMAIL!
        },
        to: [
          {
            email: correo,
            name: `${nombre} ${apellido}`
          }
        ],
        subject: `⚠️ Recordatorio de Pago - Depto #${departamento} - ${dias_atraso} días de atraso`,
        htmlContent: htmlContent
      })
    })

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json()
      console.error('❌ Error de Brevo:', errorData)
      throw new Error(errorData.message || 'Error al enviar email con Brevo')
    }

    const brevoData = await brevoResponse.json()
    console.log('✅ Email enviado exitosamente:', brevoData)

    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
      messageId: brevoData.messageId
    })

  } catch (error) {
    console.error("❌ Error sending reminder email:", error)
    return NextResponse.json(
      { 
        error: "Error al enviar el recordatorio",
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
