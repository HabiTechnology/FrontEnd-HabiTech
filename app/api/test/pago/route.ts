import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Obtener un pago de ejemplo
    const pagos = await sql`
      SELECT 
        p.id,
        p.monto,
        p.tipo_pago::text as tipo_pago,
        p.estado::text as estado,
        p.descripcion,
        p.fecha_vencimiento,
        p.fecha_pago,
        p.metodo_pago::text as metodo_pago
      FROM pagos p
      LIMIT 1
    `

    if (pagos.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No hay pagos en la base de datos"
      })
    }

    const pago = pagos[0]
    
    // Intentar obtener datos del residente y departamento
    const pagoCompleto = await sql`
      SELECT 
        p.id,
        p.monto::numeric as monto,
        p.tipo_pago::text as tipo_pago,
        p.estado::text as estado,
        p.descripcion,
        p.fecha_vencimiento::text as fecha_vencimiento,
        p.fecha_pago::text as fecha_pago,
        p.metodo_pago::text as metodo_pago,
        p.id_transaccion as referencia,
        
        -- Datos del residente
        u.nombre as residente_nombre,
        u.apellido as residente_apellido,
        u.correo as residente_correo,
        
        -- Datos del departamento
        d.numero as departamento_numero,
        d.piso as departamento_piso
        
      FROM pagos p
      LEFT JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON p.departamento_id = d.id
      WHERE p.id = ${pago.id}
    `

    return NextResponse.json({
      success: true,
      pagoSimple: pago,
      pagoCompleto: pagoCompleto[0],
      message: "Endpoint de prueba funcionando"
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
