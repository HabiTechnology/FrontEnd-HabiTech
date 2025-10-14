import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { sendAnuncioEmailBulk } from "@/lib/email-service";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { titulo, mensaje, tipo } = await request.json();

    console.log("📢 Broadcasting notification to all residents:", { titulo, mensaje, tipo });

    // Validar campos requeridos
    if (!titulo || !mensaje || !tipo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Obtener todos los residentes activos con su información de usuario
    const residentes = await sql`
      SELECT 
        r.id, 
        r.usuario_id,
        u.correo,
        u.nombre,
        u.apellido
      FROM residentes r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.activo = true
    `;

    if (residentes.length === 0) {
      return NextResponse.json(
        { error: "No hay residentes en el sistema" },
        { status: 404 }
      );
    }

    // Determinar icono basado en tipo
    const iconMap: Record<string, string> = {
      pago: "dollar-sign",
      anuncio: "info",
      sistema: "settings",
      chat: "message-circle",
    };
    const icono = iconMap[tipo] || "info";

    // Insertar una notificación para cada residente (usando usuario_id)
    const notificaciones = [];
    for (const residente of residentes) {
      const result = await sql`
        INSERT INTO notificaciones (
          usuario_id, titulo, mensaje, tipo, icono, url_accion, leido
        ) VALUES (
          ${residente.usuario_id},
          ${titulo},
          ${mensaje},
          ${tipo},
          ${icono},
          '/notificaciones',
          false
        )
        RETURNING *
      `;
      notificaciones.push(result[0]);
    }

    console.log(`✅ Notificaciones enviadas a ${notificaciones.length} residentes`);

    // Si es un anuncio, enviar también por email
    let emailResultados = null;
    let totalEmailsIntentados = 0;
    
    if (tipo === "anuncio") {
      try {
        // Filtrar residentes con correo válido
        const residentesConEmail = residentes
          .filter(r => r.correo)
          .map(r => ({
            email: r.correo,
            nombre: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "Residente"
          }));

        totalEmailsIntentados = residentesConEmail.length;

        if (residentesConEmail.length > 0) {
          console.log(`📧 Enviando anuncio por email a ${residentesConEmail.length} residentes`);
          
          emailResultados = await sendAnuncioEmailBulk(
            residentesConEmail,
            titulo,
            mensaje
          );

          console.log(`✅ Emails enviados: ${emailResultados.exitosos} exitosos, ${emailResultados.fallidos} fallidos`);
        } else {
          console.warn("⚠️ No hay residentes con correo registrado");
        }
      } catch (emailError: any) {
        // No fallar la creación de notificaciones si fallan los emails
        console.error("❌ Error enviando emails masivos:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas a ${notificaciones.length} residentes`,
      count: notificaciones.length,
      emailResults: emailResultados ? {
        sent: emailResultados.exitosos,
        failed: emailResultados.fallidos,
        total: totalEmailsIntentados
      } : null
    });

  } catch (error) {
    console.error("❌ Error broadcasting notifications:", error);
    return NextResponse.json(
      { error: "Error al enviar notificaciones masivas", details: String(error) },
      { status: 500 }
    );
  }
}
