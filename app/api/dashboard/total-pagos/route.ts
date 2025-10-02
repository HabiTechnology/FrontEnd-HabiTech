import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("💰 Calculando total de pagos en la base de datos...")

    // Total de todos los pagos en la base de datos
    const totalGeneral = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total_general,
        COUNT(*) as cantidad_pagos,
        COUNT(*) FILTER (WHERE estado = 'pagado') as pagos_completados,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pagos_pendientes,
        COUNT(*) FILTER (WHERE estado = 'atrasado') as pagos_atrasados,
        COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as total_pagados,
        COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) as total_pendientes,
        COALESCE(SUM(CASE WHEN estado = 'atrasado' THEN monto ELSE 0 END), 0) as total_atrasados
      FROM pagos
    `

    // Total del mes actual
    const totalMesActual = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total_mes,
        COUNT(*) as cantidad_mes
      FROM pagos
      WHERE EXTRACT(MONTH FROM creado_en) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM creado_en) = EXTRACT(YEAR FROM CURRENT_DATE)
    `

    const result = {
      total_general: Number(totalGeneral[0].total_general),
      cantidad_pagos: Number(totalGeneral[0].cantidad_pagos),
      pagos_completados: Number(totalGeneral[0].pagos_completados),
      pagos_pendientes: Number(totalGeneral[0].pagos_pendientes),
      pagos_atrasados: Number(totalGeneral[0].pagos_atrasados),
      total_pagados: Number(totalGeneral[0].total_pagados),
      total_pendientes: Number(totalGeneral[0].total_pendientes),
      total_atrasados: Number(totalGeneral[0].total_atrasados),
      mes_actual: {
        total: Number(totalMesActual[0].total_mes),
        cantidad: Number(totalMesActual[0].cantidad_mes)
      }
    }

    console.log("✅ Total de pagos calculado:", result)

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    })

  } catch (error) {
    console.error("❌ Error al calcular total de pagos:", error)
    return NextResponse.json(
      { 
        error: "Error al calcular total de pagos",
        details: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    )
  }
}
