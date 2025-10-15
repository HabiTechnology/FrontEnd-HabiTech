import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🔍 DEBUG: Analizando fechas de registros...")

    // Ver la fecha actual del servidor
    const fechaServidor = await sql`
      SELECT 
        CURRENT_DATE as fecha_actual,
        CURRENT_TIMESTAMP as timestamp_actual,
        NOW() as now_actual
    `
    
    // Ver todas las fechas únicas de registros
    const fechasRegistros = await sql`
      SELECT 
        fecha_hora,
        fecha_hora::date as solo_fecha,
        tipo,
        id
      FROM registros_acceso
      ORDER BY fecha_hora DESC
      LIMIT 30
    `

    // Contar registros por fecha
    const registrosPorFecha = await sql`
      SELECT 
        fecha_hora::date as fecha,
        COUNT(*) as cantidad,
        SUM(CASE WHEN tipo = 'entrada' THEN 1 ELSE 0 END) as entradas,
        SUM(CASE WHEN tipo = 'salida' THEN 1 ELSE 0 END) as salidas
      FROM registros_acceso
      GROUP BY fecha_hora::date
      ORDER BY fecha DESC
      LIMIT 10
    `

    // Probar la consulta de "hoy"
    const pruebaHoy = await sql`
      SELECT 
        COUNT(*) as total,
        MIN(fecha_hora) as primera_fecha,
        MAX(fecha_hora) as ultima_fecha
      FROM registros_acceso
      WHERE fecha_hora >= CURRENT_DATE
      AND fecha_hora < CURRENT_DATE + INTERVAL '1 day'
    `

    return NextResponse.json({
      fecha_servidor: fechaServidor[0],
      ultimos_30_registros: fechasRegistros,
      registros_por_fecha: registrosPorFecha,
      prueba_consulta_hoy: pruebaHoy[0],
      mensaje: "Revisa si las fechas de los registros coinciden con CURRENT_DATE"
    })

  } catch (error: any) {
    console.error("❌ Error en debug:", error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
