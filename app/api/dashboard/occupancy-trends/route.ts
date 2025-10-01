import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🏢 Fetching occupancy trends...")

    // Obtener ocupación de los últimos 6 meses
    const result = await sql`
      WITH meses AS (
        SELECT 
          TO_CHAR(fecha_mes, 'Mon') as mes,
          fecha_mes
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
          DATE_TRUNC('month', CURRENT_DATE),
          '1 month'::interval
        ) AS fecha_mes
      ),
      ocupacion_por_mes AS (
        SELECT 
          DATE_TRUNC('month', sr.fecha_inicio) as mes_inicio,
          COUNT(DISTINCT d.id) as ocupados
        FROM solicitudes_renta sr
        JOIN departamentos d ON sr.departamento_id = d.id
        WHERE 
          sr.estado = 'aprobado'
          AND sr.fecha_inicio >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', sr.fecha_inicio)
      ),
      total_deptos AS (
        SELECT COUNT(*) as total FROM departamentos
      )
      SELECT 
        m.mes,
        COALESCE(o.ocupados, 0) as ocupados,
        (SELECT total FROM total_deptos) - COALESCE(o.ocupados, 0) as disponibles
      FROM meses m
      LEFT JOIN ocupacion_por_mes o ON m.fecha_mes = o.mes_inicio
      ORDER BY m.fecha_mes ASC
    `

    console.log("🏢 Occupancy trends result:", result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in occupancy-trends API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener tendencias de ocupación",
        data: []
      },
      { status: 500 }
    )
  }
}
