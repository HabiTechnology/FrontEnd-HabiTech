import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Obteniendo departamento por ID:', params.id);
    
    const departamento = await sql`
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
      WHERE id = ${params.id}
    `;

    if (departamento.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Departamento encontrado:', departamento[0]);
    return NextResponse.json(departamento[0]);

  } catch (error) {
    console.error('❌ Error obteniendo departamento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Actualizando departamento por ID:', params.id);
    
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
      imagenes,
      activo
    } = body;

    // Actualizar departamento
    const departamentoActualizado = await sql`
      UPDATE departamentos 
      SET 
        numero = COALESCE(${numero}, numero),
        piso = COALESCE(${piso}, piso),
        dormitorios = COALESCE(${dormitorios}, dormitorios),
        banos = COALESCE(${banos}, banos),
        area_m2 = COALESCE(${area_m2}, area_m2),
        renta_mensual = COALESCE(${renta_mensual}, renta_mensual),
        mantenimiento_mensual = COALESCE(${mantenimiento_mensual}, mantenimiento_mensual),
        estado = COALESCE(${estado}, estado),
        descripcion = COALESCE(${descripcion}, descripcion),
        servicios = COALESCE(${servicios}, servicios),
        imagenes = COALESCE(${imagenes}, imagenes),
        activo = COALESCE(${activo}, activo)
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (departamentoActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Departamento actualizado exitosamente:', departamentoActualizado[0]);
    return NextResponse.json(departamentoActualizado[0]);

  } catch (error) {
    console.error('❌ Error actualizando departamento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Eliminando departamento por ID:', params.id);
    
    // Cambiar estado a "no_disponible" en lugar de eliminar físicamente
    const departamentoEliminado = await sql`
      UPDATE departamentos 
      SET 
        activo = false
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (departamentoEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Departamento eliminado exitosamente:', departamentoEliminado[0]);
    return NextResponse.json({ 
      message: 'Departamento marcado como no disponible', 
      departamento: departamentoEliminado[0] 
    });

  } catch (error) {
    console.error('❌ Error eliminando departamento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}