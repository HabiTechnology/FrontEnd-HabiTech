import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitudId = parseInt(params.id)
    
    if (isNaN(solicitudId)) {
      return NextResponse.json(
        { error: 'ID de solicitud inválido' },
        { status: 400 }
      )
    }

    console.log('🔍 Obteniendo solicitud:', solicitudId)

    const result = await sql`
      SELECT 
        sr.*,
        d.numero as departamento_numero,
        d.piso as departamento_piso,
        d.dormitorios as departamento_dormitorios,
        d.banos as departamento_banos,
        d.area_m2 as departamento_area,
        d.renta_mensual as departamento_renta,
        d.estado as departamento_estado,
        u.nombre as procesado_por_nombre,
        u.apellido as procesado_por_apellido
      FROM solicitudes_renta sr
      LEFT JOIN departamentos d ON sr.departamento_id = d.id
      LEFT JOIN usuarios u ON sr.procesado_por = u.id
      WHERE sr.id = ${solicitudId}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    console.log('✅ Solicitud obtenida exitosamente')

    return NextResponse.json(result[0])

  } catch (error) {
    console.error('❌ Error al obtener solicitud:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitudId = parseInt(params.id)
    const body = await request.json()
    
    if (isNaN(solicitudId)) {
      return NextResponse.json(
        { error: 'ID de solicitud inválido' },
        { status: 400 }
      )
    }

    console.log('📝 Actualizando solicitud:', solicitudId)

    // Verificar que la solicitud existe
    const existeSolicitud = await sql`
      SELECT id FROM solicitudes_renta WHERE id = ${solicitudId}
    `

    if (existeSolicitud.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    // Campos permitidos para actualización
    const allowedFields = [
      'estado', 'notas_admin', 'procesado_por', 'procesado_en',
      'nombre_solicitante', 'correo_solicitante', 'telefono_solicitante',
      'documento_solicitante', 'ingreso_mensual', 'ocupacion', 
      'tamano_familia', 'mascotas', 'detalles_mascotas',
      'referencias', 'documentos', 'mensaje'
    ]

    // Manejar campos específicos para la actualización
    const updates: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    // Actualizar solo los campos permitidos
    let result
    if (updates.estado) {
      result = await sql`
        UPDATE solicitudes_renta 
        SET estado = ${updates.estado},
            notas_admin = ${updates.notas_admin || null},
            procesado_por = ${updates.procesado_por || null},
            procesado_en = ${updates.procesado_en || null}
        WHERE id = ${solicitudId}
        RETURNING *
      `
    } else {
      // Para otros campos
      result = await sql`
        UPDATE solicitudes_renta 
        SET nombre_solicitante = COALESCE(${updates.nombre_solicitante}, nombre_solicitante),
            correo_solicitante = COALESCE(${updates.correo_solicitante}, correo_solicitante),
            telefono_solicitante = COALESCE(${updates.telefono_solicitante}, telefono_solicitante),
            documento_solicitante = COALESCE(${updates.documento_solicitante}, documento_solicitante),
            ingreso_mensual = COALESCE(${updates.ingreso_mensual}, ingreso_mensual),
            ocupacion = COALESCE(${updates.ocupacion}, ocupacion),
            tamano_familia = COALESCE(${updates.tamano_familia}, tamano_familia),
            mascotas = COALESCE(${updates.mascotas}, mascotas),
            detalles_mascotas = COALESCE(${updates.detalles_mascotas}, detalles_mascotas),
            mensaje = COALESCE(${updates.mensaje}, mensaje)
        WHERE id = ${solicitudId}
        RETURNING *
      `
    }

    console.log('✅ Solicitud actualizada exitosamente')

    return NextResponse.json({
      message: 'Solicitud actualizada exitosamente',
      solicitud: result[0]
    })

  } catch (error) {
    console.error('❌ Error al actualizar solicitud:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitudId = parseInt(params.id)
    
    if (isNaN(solicitudId)) {
      return NextResponse.json(
        { error: 'ID de solicitud inválido' },
        { status: 400 }
      )
    }

    console.log('🗑️ Eliminando solicitud:', solicitudId)

    // Verificar que la solicitud existe
    const existeSolicitud = await sql`
      SELECT id FROM solicitudes_renta WHERE id = ${solicitudId}
    `

    if (existeSolicitud.length === 0) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la solicitud
    const result = await sql`
      DELETE FROM solicitudes_renta 
      WHERE id = ${solicitudId}
      RETURNING id
    `

    console.log('✅ Solicitud eliminada exitosamente')

    return NextResponse.json({
      message: 'Solicitud eliminada exitosamente',
      id: solicitudId
    })

  } catch (error) {
    console.error('❌ Error al eliminar solicitud:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}