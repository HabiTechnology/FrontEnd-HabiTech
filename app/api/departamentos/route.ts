import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('🔍 Conectando a base de datos para obtener departamentos...');
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const soloDisponibles = searchParams.get('disponibles') === 'true';
    
    console.log('📊 Parámetros:', { soloDisponibles });
    console.log('🔗 DATABASE_URL existe:', !!process.env.DATABASE_URL);
    
    // Query para obtener departamentos
    const departamentos = await sql`
      SELECT 
        id,
        numero,
        piso,
        dormitorios,
        banos,
        area_m2,
        renta_mensual,
        mantenimiento_mensual,
        estado,
        descripcion,
        servicios,
        imagenes,
        activo,
        creado_en
      FROM departamentos
      ${soloDisponibles ? sql`WHERE estado = 'disponible'` : sql``}
      ORDER BY piso ASC, numero ASC
    `;

    console.log('🏠 Departamentos encontrados:', departamentos.length);
    console.log('🔎 Primer departamento:', departamentos[0]);

    // Devolver los datos directos de la tabla departamentos
    const departamentosFormateados = departamentos.map((departamento: any) => ({
      id: departamento.id,
      numero: departamento.numero,
      piso: departamento.piso,
      dormitorios: departamento.dormitorios,
      banos: departamento.banos,
      area_m2: departamento.area_m2,
      renta_mensual: departamento.renta_mensual,
      mantenimiento_mensual: departamento.mantenimiento_mensual,
      estado: departamento.estado,
      descripcion: departamento.descripcion,
      servicios: departamento.servicios,
      imagenes: departamento.imagenes,
      activo: departamento.activo,
      creado_en: departamento.creado_en
    }));

    console.log('✅ Departamentos formateados exitosamente');
    return NextResponse.json(departamentosFormateados);

  } catch (error) {
    console.error('❌ Error obteniendo departamentos:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('🔍 Creando nuevo departamento...');
    
    const body = await request.json();
    console.log('📝 Datos recibidos:', body);

    const { 
      numero, 
      piso, 
      dormitorios, 
      banos, 
      area_m2, 
      renta_mensual, 
      mantenimiento_mensual, 
      estado, 
      descripcion,
      servicios,
      imagenes
    } = body;

    // Validaciones básicas
    if (!numero || piso === undefined || !dormitorios || !banos || !renta_mensual || !mantenimiento_mensual) {
      return NextResponse.json(
        { error: 'Los campos numero, piso, dormitorios, banos, renta_mensual y mantenimiento_mensual son obligatorios' },
        { status: 400 }
      );
    }

    // Crear departamento
    const nuevoDepartamento = await sql`
      INSERT INTO departamentos (
        numero, 
        piso, 
        dormitorios, 
        banos, 
        area_m2, 
        renta_mensual, 
        mantenimiento_mensual, 
        estado, 
        descripcion,
        servicios,
        imagenes,
        activo
      )
      VALUES (
        ${numero}, 
        ${piso}, 
        ${dormitorios}, 
        ${banos}, 
        ${area_m2 || null}, 
        ${renta_mensual}, 
        ${mantenimiento_mensual}, 
        ${estado || 'disponible'}, 
        ${descripcion || null},
        ${servicios || null},
        ${imagenes || null},
        true
      )
      RETURNING *
    `;

    console.log('✅ Departamento creado exitosamente:', nuevoDepartamento[0]);
    return NextResponse.json(nuevoDepartamento[0], { status: 201 });

  } catch (error) {
    console.error('❌ Error creando departamento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}