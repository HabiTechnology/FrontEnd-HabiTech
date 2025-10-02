import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando estructura de tablas...');

    // Verificar columnas de usuarios
    const usuariosColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `;

    // Verificar si existe tabla departamentos
    const departamentosExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'departamentos'
      )
    `;

    let departamentosColumns: any[] = [];
    if (departamentosExists[0].exists) {
      departamentosColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'departamentos'
        ORDER BY ordinal_position
      `;
    }

    // Obtener datos de muestra
    const usuariosSample = await sql`SELECT * FROM usuarios LIMIT 3`;

    return NextResponse.json({
      usuarios: {
        columns: usuariosColumns,
        sample: usuariosSample
      },
      departamentos: {
        exists: departamentosExists[0].exists,
        columns: departamentosColumns
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
