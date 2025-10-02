import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Insertando notificaciones para usuario 1...');

    // Insertar varias notificaciones para el usuario 1 usando SOLO los tipos permitidos
    await sql`
      INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, icono, url_accion, leido)
      VALUES 
        (1, 'Recordatorio de pago', 'Recuerda que tu pago vence el día 10', 'pago', 'dollar-sign', '/financiero', false),
        (1, 'Nuevo mensaje importante', 'Tienes un nuevo mensaje del administrador', 'anuncio', 'info', '/notificaciones', false),
        (1, 'Actualización del sistema', 'El sistema se actualizará esta noche', 'sistema', 'settings', '/notificaciones', false),
        (1, 'Nuevo chat', 'Tienes un nuevo mensaje en el chat', 'chat', 'message-circle', '/chat', false)
    `;

    // Obtener todas las notificaciones del usuario 1
    const notificaciones = await sql`
      SELECT * FROM notificaciones 
      WHERE usuario_id = 1 
      ORDER BY creado_en DESC
    `;

    return NextResponse.json({
      success: true,
      message: 'Notificaciones agregadas',
      total: notificaciones.length,
      notificaciones: notificaciones
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Error insertando notificaciones", details: String(error) },
      { status: 500 }
    );
  }
}
