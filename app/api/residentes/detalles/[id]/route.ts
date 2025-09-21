import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const residenteId = parseInt(resolvedParams.id)
    
    if (isNaN(residenteId)) {
      return NextResponse.json(
        { error: 'ID de residente inválido' },
        { status: 400 }
      )
    }

    console.log('🔍 Obteniendo detalles del residente:', residenteId)

    // Consulta solo la tabla de residentes
    const result = await sql`
      SELECT 
        id,
        usuario_id,
        departamento_id,
        tipo_relacion,
        fecha_ingreso,
        fecha_salida,
        es_principal,
        activo,
        nombre_contacto_emergencia,
        telefono_contacto_emergencia,
        creado_en
      FROM residentes 
      WHERE id = ${residenteId}
    `

    console.log('✅ Resultado de la consulta:', result)

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Residente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('❌ Error fetching residente details:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}