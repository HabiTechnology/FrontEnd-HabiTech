/**
 * Servicio de envío de correos electrónicos usando Brevo
 * Solo se utiliza para notificaciones tipo "anuncio"
 */

import * as brevo from "@getbrevo/brevo"

const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
)

interface EmailParams {
  to: string
  toName: string
  subject: string
  htmlContent: string
}

/**
 * Envía un correo electrónico a través de Brevo
 */
export async function sendEmail({ to, toName, subject, htmlContent }: EmailParams) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.sender = {
      email: process.env.BREVO_FROM_EMAIL || "alexsapereyra@gmail.com",
      name: "HabiTech - Notificaciones"
    }

    sendSmtpEmail.to = [
      {
        email: to,
        name: toName
      }
    ]

    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    console.log(`✅ Email enviado a ${to}`)
    return { success: true, response }
  } catch (error: any) {
    console.error(`❌ Error enviando email a ${to}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Genera el HTML para el email de anuncio
 */
export function generateAnuncioEmailHTML(titulo: string, mensaje: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #F5F7FA;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1A2E49 0%, #007BFF 100%);
      padding: 30px 20px;
      text-align: center;
      color: #FFFFFF;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .announcement-box {
      background-color: #F5F7FA;
      border-left: 4px solid #007BFF;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .announcement-title {
      color: #1A2E49;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    .announcement-message {
      color: #A0AAB4;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
    }
    .footer {
      background-color: #F5F7FA;
      padding: 20px;
      text-align: center;
      color: #A0AAB4;
      font-size: 13px;
      border-top: 1px solid #E5E7EB;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #007BFF;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #0056b3;
    }
    .divider {
      height: 1px;
      background-color: #E5E7EB;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏢 HabiTech</h1>
      <p>Sistema de Gestión de Edificios</p>
    </div>
    
    <div class="content">
      <p style="color: #A0AAB4; margin-bottom: 20px;">
        Estimado residente,
      </p>
      
      <div class="announcement-box">
        <h2 class="announcement-title">📢 ${titulo}</h2>
        <p class="announcement-message">${mensaje}</p>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #A0AAB4; font-size: 14px; margin-top: 20px;">
        Para más información, accede a tu panel de notificaciones en la plataforma HabiTech.
      </p>
      
      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/notificaciones" class="button">
          Ver en HabiTech
        </a>
      </center>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} HabiTech - Gestión Inteligente de Edificios
      </p>
      <p style="margin: 0; font-size: 12px;">
        Este es un correo automático, por favor no responder.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Envía un anuncio por email a un residente específico
 */
export async function sendAnuncioEmail(
  email: string,
  nombre: string,
  titulo: string,
  mensaje: string
) {
  const htmlContent = generateAnuncioEmailHTML(titulo, mensaje)
  
  return await sendEmail({
    to: email,
    toName: nombre,
    subject: `📢 Nuevo anuncio: ${titulo}`,
    htmlContent
  })
}

/**
 * Envía anuncios por email a múltiples residentes
 */
export async function sendAnuncioEmailBulk(
  residentes: Array<{ email: string; nombre: string }>,
  titulo: string,
  mensaje: string
) {
  const resultados = {
    exitosos: 0,
    fallidos: 0,
    detalles: [] as Array<{ email: string; success: boolean; error?: string }>
  }

  for (const residente of residentes) {
    const result = await sendAnuncioEmail(residente.email, residente.nombre, titulo, mensaje)
    
    if (result.success) {
      resultados.exitosos++
    } else {
      resultados.fallidos++
    }
    
    resultados.detalles.push({
      email: residente.email,
      success: result.success,
      error: result.error
    })
    
    // Pequeño delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return resultados
}
