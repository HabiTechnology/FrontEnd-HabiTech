import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get("limite") || "50");

    console.log("🔍 Obteniendo TODAS las notificaciones de la base de datos");

    // Obtener TODAS las notificaciones con información del usuario
    const notificaciones = await sql`
      SELECT 
        n.id,
        n.usuario_id,
        n.titulo,
        n.mensaje,
        n.tipo,
        n.icono,
        n.url_accion,
        n.leido,
        n.leido_en,
        n.creado_en,
        u.nombre,
        u.apellido,
        COALESCE(d.numero, 'N/A') as departamento_numero,
        COALESCE(d.piso, 0) as departamento_piso
      FROM notificaciones n
      LEFT JOIN usuarios u ON n.usuario_id = u.id
      LEFT JOIN residentes r ON u.id = r.usuario_id AND r.activo = true
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      ORDER BY n.creado_en DESC
      LIMIT ${limite}
    `;

    // Contar totales
    const totales = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE leido = false) as no_leidas
      FROM notificaciones
    `;

    const total = Number(totales[0].total);
    const no_leidas = Number(totales[0].no_leidas);

    console.log(`✅ ${notificaciones.length} notificaciones encontradas (Total: ${total}, No leídas: ${no_leidas})`);

    return NextResponse.json({
      notificaciones,
      total,
      no_leidas,
      limite,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener todas las notificaciones:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener las notificaciones",
        details: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}
