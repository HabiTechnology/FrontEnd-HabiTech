import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🏠 Obteniendo lista de residentes...");

    // Obtener todos los residentes con su departamento y datos del usuario
    const residentes = await sql`
      SELECT 
        r.id,
        r.usuario_id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        d.numero as departamento_numero,
        d.piso as departamento_piso,
        r.tipo_relacion
      FROM residentes r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      WHERE r.activo = true
      ORDER BY d.piso, d.numero, u.nombre
    `;

    console.log(`✅ ${residentes.length} residentes encontrados`);

    return NextResponse.json({
      success: true,
      residentes: residentes,
      total: residentes.length
    });

  } catch (error) {
    console.error("❌ Error obteniendo residentes:", error);
    return NextResponse.json(
      { error: "Error al obtener residentes", details: String(error) },
      { status: 500 }
    );
  }
}
