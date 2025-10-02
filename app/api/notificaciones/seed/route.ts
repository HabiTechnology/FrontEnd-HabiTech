import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('Creating seed notifications...');

    const notificaciones = [
      {
        usuario_id: 1,
        titulo: 'Pago de renta recibido',
        mensaje: 'Tu pago de renta de $15,000 ha sido procesado exitosamente',
        tipo: 'pago',
        icono: 'dollar-sign',
        url_accion: '/financiero',
        leido: false
      },
      {
        usuario_id: 1,
        titulo: 'Mantenimiento programado',
        mensaje: 'Mantenimiento de elevadores el proximo lunes de 9:00 a 12:00',
        tipo: 'mantenimiento',
        icono: 'wrench',
        url_accion: '/notificaciones',
        leido: false
      },
      {
        usuario_id: 1,
        titulo: 'Nueva solicitud pendiente',
        mensaje: 'Tienes una solicitud de mudanza pendiente de aprobacion',
        tipo: 'solicitud',
        icono: 'file-text',
        url_accion: '/solicitudes',
        leido: false
      }
    ];

    const results = [];
    for (const notif of notificaciones) {
      const result = await sql`
        INSERT INTO notificaciones (
          usuario_id, titulo, mensaje, tipo, icono, url_accion, leido
        ) VALUES (
          ${notif.usuario_id},
          ${notif.titulo},
          ${notif.mensaje},
          ${notif.tipo},
          ${notif.icono},
          ${notif.url_accion},
          ${notif.leido}
        )
        RETURNING *
      `;
      results.push(result[0]);
    }

    return NextResponse.json({
      success: true,
      message: 'Notificaciones creadas',
      notificaciones: results
    });

  } catch (error) {
    console.error("Error seeding notifications:", error);
    return NextResponse.json(
      { error: "Error al crear notificaciones de prueba", details: error },
      { status: 500 }
    );
  }
}
