import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Obtener los valores permitidos para el tipo ENUM
    const enumValues = await sql`
      SELECT e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'tipo_notificacion'
      ORDER BY e.enumsortorder
    `;

    // Obtener todas las notificaciones del usuario 1
    const notificaciones = await sql`
      SELECT * FROM notificaciones 
      WHERE usuario_id = 1 
      ORDER BY creado_en DESC
    `;

    return NextResponse.json({
      enumValues: enumValues,
      notificaciones: notificaciones,
      count: notificaciones.length
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Error verificando", details: String(error) },
      { status: 500 }
    );
  }
}
