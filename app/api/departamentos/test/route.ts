import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    
    // Probar conexión básica
    const testQuery = await sql`SELECT 1 as test`
    console.log('✅ Conexión básica exitosa:', testQuery)
    
    // Verificar tabla departamentos
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'departamentos'
    `
    console.log('📊 Verificación de tabla departamentos:', tableCheck)
    
    // Verificar columnas de la tabla
    const columnsCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'departamentos'
      ORDER BY ordinal_position
    `
    console.log('📋 Columnas de la tabla departamentos:', columnsCheck)
    
    // Contar registros existentes
    const countQuery = await sql`SELECT COUNT(*) as total FROM departamentos`
    console.log('📈 Total de departamentos:', countQuery)
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexión a base de datos exitosa',
      data: {
        conexion: 'OK',
        tabla_existe: tableCheck.length > 0,
        columnas: columnsCheck,
        total_departamentos: parseInt(countQuery[0].total)
      }
    })

  } catch (error) {
    console.error('❌ Error en prueba de conexión:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Error de conexión a la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}