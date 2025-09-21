import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('🔍 Conectando a base de datos real...');
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get('activos') === 'true';
    
    console.log('📊 Parámetros:', { soloActivos });
    console.log('🔗 DATABASE_URL existe:', !!process.env.DATABASE_URL);
    
    // Query usando SOLO la tabla residentes, sin JOINs
    const residentes = await sql`
      SELECT 
        id,
        usuario_id,
        departamento_id,
        tipo_relacion,
        fecha_ingreso,
        fecha_salida,
        nombre_contacto_emergencia,
        telefono_contacto_emergencia,
        es_principal,
        activo,
        creado_en
      FROM residentes
      ${soloActivos ? sql`WHERE activo = true` : sql``}
      ORDER BY fecha_ingreso DESC, id ASC
    `;

    console.log('📋 Residentes encontrados:', residentes.length);
    console.log('🔎 Primer residente:', residentes[0]);

    // Devolver los datos directos de la tabla residentes
    const residentesFormateados = residentes.map((residente: any) => ({
      id: residente.id,
      usuario_id: residente.usuario_id,
      departamento_id: residente.departamento_id,
      tipo_relacion: residente.tipo_relacion,
      fecha_ingreso: residente.fecha_ingreso,
      fecha_salida: residente.fecha_salida,
      nombre_contacto_emergencia: residente.nombre_contacto_emergencia,
      telefono_contacto_emergencia: residente.telefono_contacto_emergencia,
      es_principal: residente.es_principal,
      activo: residente.activo,
      creado_en: residente.creado_en
    }));

    console.log('✅ Datos formateados exitosamente');
    return NextResponse.json(residentesFormateados);

  } catch (error) {
    console.error('❌ Error obteniendo residentes:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
