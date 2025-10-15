import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Body recibido:', body)
    
    const { 
      residente_id, 
      tipo_pago, 
      monto, 
      fecha_vencimiento, 
      descripcion, 
      recargo = 0,
      metodo_pago = null,
      estado = 'pendiente'
    } = body

    // Validaciones
    if (!residente_id || !tipo_pago || !monto || !fecha_vencimiento || !descripcion) {
      console.error('❌ Validación fallida - campos faltantes')
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: residente_id, tipo_pago, monto, fecha_vencimiento, descripcion' },
        { status: 400 }
      )
    }

    if (parseFloat(monto) <= 0) {
      console.error('❌ Validación fallida - monto inválido')
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (parseFloat(recargo) < 0) {
      console.error('❌ Validación fallida - recargo inválido')
      return NextResponse.json(
        { error: 'El recargo no puede ser negativo' },
        { status: 400 }
      )
    }

    const tiposValidos = ['renta', 'mantenimiento', 'servicio', 'multa', 'deposito', 'otro']
    if (!tiposValidos.includes(tipo_pago)) {
      console.error('❌ Validación fallida - tipo de pago inválido')
      return NextResponse.json(
        { error: 'Tipo de pago inválido' },
        { status: 400 }
      )
    }

    // Validar metodo_pago si se proporciona
    if (metodo_pago) {
      const metodosValidos = ['efectivo', 'transferencia', 'tarjeta', 'online']
      if (!metodosValidos.includes(metodo_pago)) {
        console.error('❌ Validación fallida - método de pago inválido')
        return NextResponse.json(
          { error: 'Método de pago inválido' },
          { status: 400 }
        )
      }
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'pagado', 'atrasado', 'cancelado']
    if (!estadosValidos.includes(estado)) {
      console.error('❌ Validación fallida - estado inválido')
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    console.log('✅ Validaciones pasadas, verificando residente...')

    // Verificar que el residente existe
    const residenteCheck = await sql`
      SELECT r.id, r.departamento_id, r.usuario_id
      FROM residentes r
      WHERE r.id = ${residente_id} AND r.activo = true
    `

    if (residenteCheck.length === 0) {
      return NextResponse.json(
        { error: 'Residente no encontrado o inactivo' },
        { status: 404 }
      )
    }

    console.log('✅ Residente verificado:', residenteCheck[0])

    const departamento_id = residenteCheck[0].departamento_id

    if (!departamento_id) {
      console.error('❌ El residente no tiene departamento asignado')
      return NextResponse.json(
        { error: 'El residente no tiene un departamento asignado' },
        { status: 400 }
      )
    }

    // Crear el pago
    const result = metodo_pago 
      ? await sql`
          INSERT INTO pagos (
            residente_id,
            departamento_id,
            tipo_pago, 
            monto, 
            estado, 
            fecha_vencimiento, 
            descripcion,
            recargo,
            metodo_pago,
            creado_en
          ) VALUES (
            ${residente_id},
            ${departamento_id},
            ${tipo_pago}::tipo_pago, 
            ${parseFloat(monto)}, 
            ${estado}::estado_pago, 
            ${fecha_vencimiento}::date, 
            ${descripcion},
            ${parseFloat(recargo)},
            ${metodo_pago}::metodo_pago,
            NOW()
          )
          RETURNING *
        `
      : await sql`
          INSERT INTO pagos (
            residente_id,
            departamento_id,
            tipo_pago, 
            monto, 
            estado, 
            fecha_vencimiento, 
            descripcion,
            recargo,
            creado_en
          ) VALUES (
            ${residente_id},
            ${departamento_id},
            ${tipo_pago}::tipo_pago, 
            ${parseFloat(monto)}, 
            ${estado}::estado_pago, 
            ${fecha_vencimiento}::date, 
            ${descripcion},
            ${parseFloat(recargo)},
            NOW()
          )
          RETURNING *
        `

    const pago = result[0]

    console.log('✅ Pago insertado en BD:', pago)

    // Obtener información completa del pago con datos del residente y usuario
    const pagoCompleto = await sql`
      SELECT 
        p.*,
        u.nombre as residente_nombre,
        u.apellido as residente_apellido,
        u.correo as residente_correo,
        d.numero as numero_departamento,
        d.piso
      FROM pagos p
      INNER JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      WHERE p.id = ${pago.id}
    `

    console.log('✅ Pago creado exitosamente:', pagoCompleto[0])

    return NextResponse.json({
      success: true,
      message: 'Pago creado exitosamente',
      data: pagoCompleto[0]
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error completo al crear pago:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al crear el pago',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
