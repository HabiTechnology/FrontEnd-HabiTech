import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Obteniendo usuario por ID:', params.id);
    
    const usuario = await sql`
      SELECT 
        id,
        correo,
        nombre,
        apellido,
        telefono,
        numero_documento,
        imagen_perfil,
        rol_id,
        activo,
        creado_en,
        actualizado_en
      FROM usuarios
      WHERE id = ${params.id}
    `;

    if (usuario.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Usuario encontrado:', usuario[0]);
    return NextResponse.json(usuario[0]);

  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
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
    console.log('🔍 Actualizando usuario por ID:', params.id);
    
    const body = await request.json();
    console.log('📝 Datos recibidos:', body);

    const { correo, hash_contrasena, nombre, apellido, telefono, numero_documento, imagen_perfil, rol_id, activo } = body;

    // Actualizar usuario
    const usuarioActualizado = await sql`
      UPDATE usuarios 
      SET 
        correo = COALESCE(${correo}, correo),
        hash_contrasena = COALESCE(${hash_contrasena}, hash_contrasena),
        nombre = COALESCE(${nombre}, nombre),
        apellido = COALESCE(${apellido}, apellido),
        telefono = COALESCE(${telefono}, telefono),
        numero_documento = COALESCE(${numero_documento}, numero_documento),
        imagen_perfil = COALESCE(${imagen_perfil}, imagen_perfil),
        rol_id = COALESCE(${rol_id}, rol_id),
        activo = COALESCE(${activo}, activo),
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (usuarioActualizado.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Usuario actualizado exitosamente:', usuarioActualizado[0]);
    return NextResponse.json(usuarioActualizado[0]);

  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
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
    console.log('🔍 Eliminando usuario por ID:', params.id);
    
    // Soft delete - marcar como inactivo
    const usuarioEliminado = await sql`
      UPDATE usuarios 
      SET 
        activo = false,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (usuarioEliminado.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Usuario eliminado exitosamente:', usuarioEliminado[0]);
    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente', 
      usuario: usuarioEliminado[0] 
    });

  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}