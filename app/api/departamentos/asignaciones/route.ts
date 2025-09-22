import { NextRequest, NextResponse } from 'next/server'
import { asignarResidenteADepartamento, liberarDepartamento, sincronizarEstadosDepartamentos } from '@/lib/departamentos-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accion, residente_id, departamento_id } = body

    console.log('🏠 Procesando asignación de departamento...', { accion, residente_id, departamento_id })

    switch (accion) {
      case 'asignar':
        if (!residente_id || !departamento_id) {
          return NextResponse.json(
            { error: 'residente_id y departamento_id son requeridos para asignar' },
            { status: 400 }
          )
        }

        const resultadoAsignacion = await asignarResidenteADepartamento(residente_id, departamento_id)
        
        return NextResponse.json({
          message: 'Residente asignado exitosamente',
          data: resultadoAsignacion
        })

      case 'liberar':
        if (!departamento_id) {
          return NextResponse.json(
            { error: 'departamento_id es requerido para liberar' },
            { status: 400 }
          )
        }

        const resultadoLiberacion = await liberarDepartamento(departamento_id)
        
        return NextResponse.json({
          message: 'Departamento liberado exitosamente',
          data: resultadoLiberacion
        })

      case 'sincronizar':
        const resultadoSincronizacion = await sincronizarEstadosDepartamentos()
        
        return NextResponse.json({
          message: 'Estados sincronizados exitosamente',
          data: resultadoSincronizacion
        })

      default:
        return NextResponse.json(
          { error: 'Acción no válida. Use: asignar, liberar, o sincronizar' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Error en asignación de departamento:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}