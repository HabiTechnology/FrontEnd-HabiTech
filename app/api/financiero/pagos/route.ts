import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    console.log(`💸 Fetching all payments, limit: ${limit}`)

    const pagos = await sql`
      SELECT 
        p.id,
        p.monto,
        p.tipo_pago,
        p.estado,
        p.fecha_pago,
        p.fecha_vencimiento,
        p.metodo_pago,
        p.descripcion,
        u.nombre || ' ' || u.apellido as residente,
        u.correo as residente_correo,
        d.numero as numero_departamento,
        d.piso
      FROM pagos p
      LEFT JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      ORDER BY 
        CASE 
          WHEN p.estado = 'pendiente' AND p.fecha_vencimiento < CURRENT_DATE THEN 1
          WHEN p.estado = 'pendiente' THEN 2
          ELSE 3
        END,
        p.fecha_vencimiento DESC NULLS LAST,
        p.fecha_pago DESC NULLS LAST
      LIMIT ${limit}
    `

    console.log(`💸 Payments result: ${pagos.length} records`)

    return NextResponse.json({
      success: true,
      data: pagos,
      total: pagos.length
    })

  } catch (error) {
    console.error("❌ Error in all payments API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Error al obtener pagos",
        data: []
      },
      { status: 500 }
    )
  }
}
