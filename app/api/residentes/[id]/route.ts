import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const residenteId = parseInt(params.id)
    
    if (isNaN(residenteId)) {
      return NextResponse.json(
        { error: 'ID de residente inválido' },
        { status: 400 }
      )
    }

    console.log('🔍 Obteniendo detalles del residente:', residenteId)

    // Primero intentar con JOIN completo
    try {
      const result = await sql`
        SELECT 
          -- Información del residente
          r.id as residente_id,
          r.tipo_relacion,
          r.fecha_ingreso,
          r.fecha_salida,
          r.es_principal,
          r.activo as residente_activo,
          r.nombre_contacto_emergencia,
          r.telefono_contacto_emergencia,
          r.creado_en as residente_creado_en,
          
          -- Información del usuario (puede ser NULL)
          u.id as usuario_id,
          u.nombre as usuario_nombre,
          u.apellido as usuario_apellido,
          u.email as usuario_email,
          u.telefono as usuario_telefono,
          u.fecha_nacimiento,
          u.documento_identidad,
          u.tipo_documento,
          u.direccion as usuario_direccion,
          u.activo as usuario_activo,
          u.creado_en as usuario_creado_en,
          
          -- Información del departamento (puede ser NULL)
          d.id as departamento_id,
          d.numero as departamento_numero,
          d.piso,
          d.torre,
          d.tipo_departamento,
          d.area_m2,
          d.num_habitaciones,
          d.num_banos,
          d.tiene_balcon,
          d.tiene_parqueadero,
          d.activo as departamento_activo,
          d.creado_en as departamento_creado_en
          
        FROM residentes r
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN departamentos d ON r.departamento_id = d.id
        WHERE r.id = ${residenteId}
      `

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Residente no encontrado' },
          { status: 404 }
        )
      }

      console.log('✅ JOIN exitoso, devolviendo datos completos')
      return NextResponse.json(result[0])

    } catch (joinError) {
      console.log('⚠️ JOIN falló, intentando solo con tabla residentes')
      
      // Si el JOIN falla, usar solo la tabla residentes
      const result = await sql`
        SELECT 
          id as residente_id,
          usuario_id,
          departamento_id,
          tipo_relacion,
          fecha_ingreso,
          fecha_salida,
          es_principal,
          activo as residente_activo,
          nombre_contacto_emergencia,
          telefono_contacto_emergencia,
          creado_en as residente_creado_en,
          
          -- Campos simulados para compatibilidad
          NULL as usuario_nombre,
          NULL as usuario_apellido,
          NULL as usuario_email,
          NULL as usuario_telefono,
          NULL as fecha_nacimiento,
          NULL as documento_identidad,
          NULL as tipo_documento,
          NULL as usuario_direccion,
          NULL as usuario_activo,
          NULL as usuario_creado_en,
          
          NULL as departamento_numero,
          NULL as piso,
          NULL as torre,
          NULL as tipo_departamento,
          NULL as area_m2,
          NULL as num_habitaciones,
          NULL as num_banos,
          NULL as tiene_balcon,
          NULL as tiene_parqueadero,
          NULL as departamento_activo,
          NULL as departamento_creado_en
          
        FROM residentes
        WHERE id = ${residenteId}
      `

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Residente no encontrado' },
          { status: 404 }
        )
      }

      console.log('✅ Solo tabla residentes, devolviendo datos básicos')
      return NextResponse.json(result[0])
    }

  } catch (error) {
    console.error('❌ Error completo:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}