import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

// Crear notificación de prueba para el usuario actual (usuario_id = 1)
export async function POST(request: NextRequest) {
  try {
    const { titulo, mensaje, tipo } = await request.json();

    console.log("📝 Creando notificación de prueba para usuario_id = 1");

    const iconMap: Record<string, string> = {
      pago: "dollar-sign",
      anuncio: "info",
      sistema: "settings",
      chat: "message-circle",
    };

    const result = await sql`
      INSERT INTO notificaciones (
        usuario_id, titulo, mensaje, tipo, icono, url_accion, leido
      ) VALUES (
        1,
        ${titulo || 'Notificación de prueba'},
        ${mensaje || 'Esta es una notificación de prueba'},
        ${tipo || 'sistema'},
        ${iconMap[tipo] || 'info'},
        '/notificaciones',
        false
      )
      RETURNING *
    `;

    console.log("✅ Notificación creada:", result[0]);

    return NextResponse.json({
      success: true,
      notificacion: result[0]
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
