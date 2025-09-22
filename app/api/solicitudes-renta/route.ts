import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log('🔍 Obteniendo solicitudes de renta...')

    let query = sql`
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
    `

    let result
    if (estado) {
      result = await sql`
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
        WHERE sr.estado = ${estado}
        ORDER BY sr.creado_en DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
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
        ORDER BY sr.creado_en DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Obtener el total de registros para paginación
    let countResult
    if (estado) {
      countResult = await sql`SELECT COUNT(*) as total FROM solicitudes_renta WHERE estado = ${estado}`
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM solicitudes_renta`
    }
    
    const total = parseInt(countResult[0].total)

    console.log('✅ Solicitudes obtenidas:', result.length)

    return NextResponse.json({
      solicitudes: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📝 Creando nueva solicitud de renta...')

    // Validaciones básicas
    const requiredFields = [
      'departamento_id', 'nombre_solicitante', 'correo_solicitante', 
      'telefono_solicitante', 'documento_solicitante', 'ingreso_mensual',
      'ocupacion', 'tamano_familia'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        )
      }
    }

    // Verificar que el departamento existe y está disponible
    const departamento = await sql`
      SELECT id, estado FROM departamentos 
      WHERE id = ${body.departamento_id} AND activo = true
    `

    if (departamento.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado o no disponible' },
        { status: 404 }
      )
    }

    if (departamento[0].estado !== 'disponible') {
      return NextResponse.json(
        { error: 'El departamento no está disponible para renta' },
        { status: 400 }
      )
    }

    // Crear la solicitud
    const result = await sql`
      INSERT INTO solicitudes_renta (
        departamento_id, nombre_solicitante, correo_solicitante,
        telefono_solicitante, documento_solicitante, ingreso_mensual,
        ocupacion, tamano_familia, mascotas, detalles_mascotas,
        referencias, documentos, mensaje
      ) VALUES (
        ${body.departamento_id}, ${body.nombre_solicitante}, ${body.correo_solicitante},
        ${body.telefono_solicitante}, ${body.documento_solicitante}, ${body.ingreso_mensual},
        ${body.ocupacion}, ${body.tamano_familia}, ${body.mascotas || false}, 
        ${body.detalles_mascotas || null}, ${JSON.stringify(body.referencias || {})},
        ${JSON.stringify(body.documentos || {})}, ${body.mensaje || null}
      ) RETURNING *
    `

    console.log('✅ Solicitud creada exitosamente:', result[0].id)

    return NextResponse.json(
      { 
        message: 'Solicitud creada exitosamente',
        solicitud: result[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ Error al crear solicitud:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}