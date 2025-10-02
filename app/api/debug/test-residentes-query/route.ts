import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Probando query de residentes...");

    // Probar el query
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

    return NextResponse.json({
      success: true,
      count: residentes.length,
      residentes: residentes
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
