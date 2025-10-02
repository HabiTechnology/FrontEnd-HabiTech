import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');

    // Listar todas las tablas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Tablas encontradas:', tables);

    // Verificar si existe la tabla notificaciones
    const notificacionesTable = tables.find((t: any) => t.table_name === 'notificaciones');
    
    if (notificacionesTable) {
      // Obtener estructura de la tabla
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'notificaciones'
        ORDER BY ordinal_position
      `;
      
      // Obtener datos
      const data = await sql`SELECT * FROM notificaciones LIMIT 10`;
      
      return NextResponse.json({
        exists: true,
        structure: columns,
        data: data,
        count: data.length
      });
    } else {
      return NextResponse.json({
        exists: false,
        tables: tables.map((t: any) => t.table_name),
        message: 'La tabla notificaciones no existe'
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Error verificando base de datos", details: String(error) },
      { status: 500 }
    );
  }
}
