import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("📊 Fetching consumption trends...")

    // Obtener consumo promedio de los últimos 7 días
    const result = await sql`
      SELECT 
        TO_CHAR(fecha, 'DD/MM') as fecha,
        COALESCE(ROUND(AVG(CASE WHEN tipo_metrica = 'agua' THEN valor END)::numeric, 2), 0) as agua,
        COALESCE(ROUND(AVG(CASE WHEN tipo_metrica = 'luz' THEN valor END)::numeric, 2), 0) as luz,
        COALESCE(ROUND(AVG(CASE WHEN tipo_metrica = 'gas' THEN valor END)::numeric, 2), 0) as gas
      FROM metricas_consumo
      WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY fecha
      ORDER BY fecha ASC
    `

    console.log("📊 Consumption trends result:", result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in consumption-trends API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener tendencias de consumo",
        data: []
      },
      { status: 500 }
    )
  }
}
