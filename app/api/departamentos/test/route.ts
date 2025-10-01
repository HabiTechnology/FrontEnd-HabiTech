import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {

    
    // Probar conexiÃ³n bÃ¡sica
    const testQuery = await sql`SELECT 1 as test`

    
    // Verificar tabla departamentos
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'departamentos'
    `

    
    // Verificar columnas de la tabla
    const columnsCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'departamentos'
      ORDER BY ordinal_position
    `

    
    // Contar registros existentes
    const countQuery = await sql`SELECT COUNT(*) as total FROM departamentos`

    
    return NextResponse.json({
      status: 'success',
      message: 'ConexiÃ³n a base de datos exitosa',
      data: {
        conexion: 'OK',
        tabla_existe: tableCheck.length > 0,
        columnas: columnsCheck,
        total_departamentos: parseInt(countQuery[0].total)
      }
    })

  } catch (error) {

    return NextResponse.json(
      { 
        status: 'error',
        error: 'Error de conexiÃ³n a la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
