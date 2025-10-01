import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const meses = parseInt(searchParams.get('meses') || '12')
    
    console.log(`📈 Fetching financial trends for ${meses} months`)

    // Ingresos y gastos por mes (simplificado - todos los meses con datos)
    const tendencias = await sql`
      WITH meses AS (
        SELECT generate_series(
          DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${sql.unsafe(meses.toString())} months'),
          DATE_TRUNC('month', CURRENT_DATE),
          '1 month'::interval
        ) AS mes
      ),
      ingresos_mes AS (
        SELECT 
          DATE_TRUNC('month', COALESCE(fecha_pago, CURRENT_DATE)) as mes,
          COALESCE(SUM(monto), 0) as total_ingresos,
          COUNT(*) as cantidad_pagos
        FROM pagos
        WHERE estado = 'pagado'
        GROUP BY DATE_TRUNC('month', COALESCE(fecha_pago, CURRENT_DATE))
      ),
      mantenimiento_mes AS (
        SELECT 
          DATE_TRUNC('month', COALESCE(fecha_reporte, CURRENT_DATE)) as mes,
          COALESCE(SUM(costo_estimado), 0) as total_mantenimiento
        FROM solicitudes_mantenimiento
        WHERE estado IN ('completado', 'en_progreso')
        GROUP BY DATE_TRUNC('month', COALESCE(fecha_reporte, CURRENT_DATE))
      )
      SELECT 
        TO_CHAR(m.mes, 'YYYY-MM') as mes,
        TO_CHAR(m.mes, 'Mon') as mes_corto,
        COALESCE(i.total_ingresos, 0) as ingresos,
        COALESCE(i.cantidad_pagos, 0) as cantidad_pagos,
        COALESCE(ma.total_mantenimiento, 0) as gastos_mantenimiento
      FROM meses m
      LEFT JOIN ingresos_mes i ON m.mes = i.mes
      LEFT JOIN mantenimiento_mes ma ON m.mes = ma.mes
      ORDER BY m.mes
    `
    
    console.log("📈 Tendencias result:", tendencias)

    console.log("📈 Financial trends result:", tendencias)

    return NextResponse.json({
      success: true,
      data: tendencias
    })

  } catch (error) {
    console.error("❌ Error in financial trends API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Error al obtener tendencias financieras",
        data: []
      },
      { status: 500 }
    )
  }
}
