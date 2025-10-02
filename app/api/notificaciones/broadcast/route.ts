import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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

    // Obtener todos los residentes activos
    const residentes = await sql`
      SELECT id, usuario_id FROM residentes WHERE activo = true
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

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas a ${notificaciones.length} residentes`,
      count: notificaciones.length,
    });

  } catch (error) {
    console.error("❌ Error broadcasting notifications:", error);
    return NextResponse.json(
      { error: "Error al enviar notificaciones masivas", details: String(error) },
      { status: 500 }
    );
  }
}
