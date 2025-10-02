import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("💳 Fetching recent payments...")

    // Primero verificar si hay pagos
    const countResult = await sql`SELECT COUNT(*) as total FROM pagos`
    console.log("💳 Total pagos en BD:", countResult[0]?.total || 0)

    // Obtener los últimos 10 pagos con la estructura correcta
    const result = await sql`
      SELECT 
        p.id,
        p.monto,
        p.tipo_pago::text as tipo_pago,
        p.estado::text as estado,
        p.fecha_pago,
        p.fecha_vencimiento,
        p.metodo_pago::text as metodo_pago,
        p.id_transaccion as referencia,
        p.descripcion as notas,
        COALESCE(u.nombre || ' ' || u.apellido, 'Sin residente') as residente,
        COALESCE(d.numero, 'N/A') as numero_departamento
      FROM pagos p
      LEFT JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON p.departamento_id = d.id
      ORDER BY p.creado_en DESC
      LIMIT 10
    `

    console.log("💳 Recent payments result:", result)
    console.log("💳 Number of payments found:", result.length)
    
    if (result.length > 0) {
      console.log("💳 First payment sample:", result[0])
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in pagos-recientes API:", error)
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error))
    console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener pagos recientes",
        details: error instanceof Error ? error.message : String(error),
        data: []
      },
      { status: 500 }
    )
  }
}
