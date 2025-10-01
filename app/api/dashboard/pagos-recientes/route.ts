import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("💳 Fetching recent payments...")

    // Obtener los últimos 10 pagos
    const result = await sql`
      SELECT 
        p.id,
        p.monto,
        p.tipo_pago,
        p.estado,
        p.fecha_pago,
        p.metodo_pago,
        u.nombre || ' ' || u.apellido as residente,
        d.numero as numero_departamento
      FROM pagos p
      LEFT JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      ORDER BY p.fecha_pago DESC NULLS LAST
      LIMIT 10
    `

    console.log("💳 Recent payments result:", result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in pagos-recientes API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener pagos recientes",
        data: []
      },
      { status: 500 }
    )
  }
}
