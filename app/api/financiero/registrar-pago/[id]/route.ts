import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const pagoId = parseInt(params.id)
    
    console.log(' PATCH registrar-pago llamado, ID:', pagoId)
    
    if (isNaN(pagoId)) {
      return NextResponse.json(
        { error: 'ID de pago inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    console.log(' Body recibido:', body)
    
    const { metodo_pago, fecha_pago, id_transaccion } = body

    // Validaciones
    if (!metodo_pago || !fecha_pago) {
      return NextResponse.json(
        { error: 'Método de pago y fecha de pago son requeridos' },
        { status: 400 }
      )
    }

    const metodosValidos = ['efectivo', 'transferencia', 'tarjeta', 'online']
    if (!metodosValidos.includes(metodo_pago)) {
      return NextResponse.json(
        { error: 'Método de pago inválido' },
        { status: 400 }
      )
    }

    console.log(' Validaciones pasadas')

    // Verificar que el pago existe
    const pagoCheck = await sql`
      SELECT id, estado 
      FROM pagos 
      WHERE id = ${pagoId}
    `

    if (pagoCheck.length === 0) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    if (pagoCheck[0].estado === 'pagado') {
      return NextResponse.json(
        { error: 'Este pago ya ha sido registrado como pagado' },
        { status: 400 }
      )
    }

    console.log(' Pago existe, actualizando...')

    // Actualizar el pago
    const resultado = await sql`
      UPDATE pagos
      SET 
        estado = 'pagado'::estado_pago,
        fecha_pago = ${fecha_pago}::date,
        metodo_pago = ${metodo_pago}::metodo_pago,
        id_transaccion = ${id_transaccion || null},
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ${pagoId}
      RETURNING *
    `

    console.log(' Pago actualizado:', resultado[0])

    // Obtener el pago actualizado con joins
    const pagoActualizado = await sql`
      SELECT 
        p.*,
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
      WHERE p.id = ${pagoId}
    `

    console.log(' Pago registrado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Pago registrado exitosamente',
      pago: pagoActualizado[0]
    })

  } catch (error) {
    console.error(' Error registrando pago:', error)
    return NextResponse.json(
      { 
        error: 'Error al registrar el pago',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}