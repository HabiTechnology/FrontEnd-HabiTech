import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Obtener ranking de eficiencia por piso basado en consumo y pagos
    const rankingData = await sql`
      SELECT 
        d.numero as apartamento,
        CONCAT(u.nombre, ' ', u.apellido) as nombre_familia,
        d.renta_mensual as renta,
        CASE 
          WHEN mc.consumo_total IS NULL THEN 95
          WHEN mc.consumo_total < 50 THEN 95
          WHEN mc.consumo_total < 100 THEN 87
          WHEN mc.consumo_total < 150 THEN 82
          ELSE 76
        END as eficiencia,
        CASE 
          WHEN p.pagos_atrasados = 0 THEN 'SIN RETRASOS'
          WHEN p.pagos_atrasados = 1 THEN 'RETRASO MENOR'
          ELSE 'RETRASOS MÚLTIPLES'
        END as estado_pagos,
        COALESCE(p.pagos_atrasados, 0) as pagos_atrasados
      FROM departamentos d
      INNER JOIN residentes r ON d.id = r.departamento_id AND r.es_principal = true AND r.activo = true
      INNER JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN (
        SELECT 
          departamento_id,
          SUM(consumo) as consumo_total
        FROM metricas_consumo
        WHERE fecha_registro >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY departamento_id
      ) mc ON d.id = mc.departamento_id
      LEFT JOIN (
        SELECT 
          departamento_id,
          COUNT(*) FILTER (WHERE estado = 'atrasado') as pagos_atrasados
        FROM pagos
        WHERE fecha_vencimiento >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY departamento_id
      ) p ON d.id = p.departamento_id
      WHERE d.estado = 'ocupado'
      ORDER BY eficiencia DESC, pagos_atrasados ASC
      LIMIT 10
    `

    return NextResponse.json({
      ranking: rankingData.map((item, index) => ({
        posicion: index + 1,
        apartamento: item.apartamento,
        familia: item.nombre_familia,
        renta: Number(item.renta),
        eficiencia: Number(item.eficiencia),
        estadoPagos: item.estado_pagos,
        nuevosIngresos: item.pagos_atrasados === 0 ? 2 : 0
      }))
    })
  } catch (error) {
    console.error("Error fetching ranking data:", error)
    return NextResponse.json(
      { error: "Error al obtener ranking de eficiencia" },
      { status: 500 }
    )
  }
}
