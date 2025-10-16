import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log('🚨 Fetching morosos (deudores atrasados)...')

    // Obtener todos los pagos pendientes o atrasados que ya pasaron su fecha de vencimiento
    const morosos = await sql`
      SELECT 
        p.id,
        p.monto,
        p.tipo_pago,
        p.estado,
        p.fecha_vencimiento,
        p.recargo,
        p.descripcion,
        p.creado_en,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        d.numero as departamento_numero,
        d.piso as departamento_piso,
        -- Calcular días de atraso
        CURRENT_DATE - p.fecha_vencimiento as dias_atraso,
        -- Calcular total adeudado (monto + recargo)
        p.monto + COALESCE(p.recargo, 0) as total_adeudado
      FROM pagos p
      JOIN residentes r ON p.residente_id = r.id
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN departamentos d ON p.departamento_id = d.id
      WHERE 
        p.estado IN ('pendiente', 'atrasado')
        AND p.fecha_vencimiento < CURRENT_DATE
      ORDER BY 
        dias_atraso DESC,
        total_adeudado DESC
    `

    console.log(`🚨 Found ${morosos.length} morosos`)

    // Calcular estadísticas
    const totalAdeudado = morosos.reduce((sum, m) => sum + Number(m.total_adeudado), 0)
    const totalRecargos = morosos.reduce((sum, m) => sum + Number(m.recargo || 0), 0)

    return NextResponse.json({
      morosos,
      estadisticas: {
        total_morosos: morosos.length,
        total_adeudado: totalAdeudado,
        total_recargos: totalRecargos,
        promedio_dias_atraso: morosos.length > 0 
          ? Math.round(morosos.reduce((sum, m) => sum + Number(m.dias_atraso), 0) / morosos.length)
          : 0
      }
    })

  } catch (error) {
    console.error("❌ Error fetching morosos:", error)
    return NextResponse.json(
      { 
        error: "Error al obtener morosos",
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
