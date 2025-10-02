import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Verificar si hay una tabla de relación usuario-departamento
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%depart%' OR table_name LIKE '%residen%'
      ORDER BY table_name
    `;

    // Ver estructura de roles
    const roles = await sql`
      SELECT * FROM roles
    `;

    // Ver usuarios con sus roles
    const usuarios = await sql`
      SELECT u.id, u.nombre, u.apellido, u.correo, r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      LIMIT 5
    `;

    return NextResponse.json({
      tables,
      roles,
      usuarios
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
