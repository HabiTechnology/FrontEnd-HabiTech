import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const estado = searchParams.get('estado')
    
    console.log(`💸 Fetching all payments, limit: ${limit}, estado: ${estado || 'all'}`)

    let query
    
    if (estado) {
      query = sql`
        SELECT 
          p.id,
          p.monto,
          p.tipo_pago,
          p.estado,
          p.fecha_pago,
          p.fecha_vencimiento,
          p.metodo_pago,
          p.id_transaccion,
          p.recargo,
          p.descripcion,
          p.url_recibo,
          p.creado_en,
          json_build_object(
            'nombre', u.nombre,
            'apellido', u.apellido,
            'correo', u.correo
          ) as residente,
          json_build_object(
            'numero', d.numero,
            'piso', d.piso
          ) as departamento
        FROM pagos p
        JOIN residentes r ON p.residente_id = r.id
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN departamentos d ON p.departamento_id = d.id
        WHERE p.estado = ${estado}::estado_pago
        ORDER BY p.creado_en DESC
        LIMIT ${limit}
      `
    } else {
      query = sql`
        SELECT 
          p.id,
          p.monto,
          p.tipo_pago,
          p.estado,
          p.fecha_pago,
          p.fecha_vencimiento,
          p.metodo_pago,
          p.id_transaccion,
          p.recargo,
          p.descripcion,
          p.url_recibo,
          p.creado_en,
          json_build_object(
            'nombre', u.nombre,
            'apellido', u.apellido,
            'correo', u.correo
          ) as residente,
          json_build_object(
            'numero', d.numero,
            'piso', d.piso
          ) as departamento
        FROM pagos p
        JOIN residentes r ON p.residente_id = r.id
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN departamentos d ON p.departamento_id = d.id
        ORDER BY p.creado_en DESC
        LIMIT ${limit}
      `
    }

    const pagos = await query

    console.log(`💸 Payments result: ${pagos.length} records`)

    return NextResponse.json(pagos)

  } catch (error) {
    console.error("❌ Error in all payments API:", error)
    return NextResponse.json(
      { 
        error: "Error al obtener pagos",
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
