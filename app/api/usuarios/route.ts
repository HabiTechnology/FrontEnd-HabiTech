import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {

    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get('activos') === 'true';
    

    
    // Query para obtener usuarios
    const usuarios = await sql`
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
      ${soloActivos ? sql`WHERE activo = true` : sql``}
      ORDER BY creado_en DESC, id ASC
    `;



    // Devolver los datos directos de la tabla usuarios
    const usuariosFormateados = usuarios.map((usuario: any) => ({
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      numero_documento: usuario.numero_documento,
      imagen_perfil: usuario.imagen_perfil,
      rol_id: usuario.rol_id,
      activo: usuario.activo,
      creado_en: usuario.creado_en,
      actualizado_en: usuario.actualizado_en
    }));

    return NextResponse.json(usuariosFormateados);

  } catch (error) {

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

    
    const body = await request.json();

    const { correo, hash_contrasena, nombre, apellido, telefono, numero_documento, imagen_perfil, rol_id } = body;

    // Validaciones básicas
    if (!correo || !hash_contrasena || !nombre || !apellido || !numero_documento) {
      return NextResponse.json(
        { error: 'Los campos correo, hash_contrasena, nombre, apellido y numero_documento son obligatorios' },
        { status: 400 }
      );
    }

    // Crear usuario
    const nuevoUsuario = await sql`
      INSERT INTO usuarios (
        correo, 
        hash_contrasena, 
        nombre, 
        apellido, 
        telefono, 
        numero_documento, 
        imagen_perfil, 
        rol_id, 
        activo
      )
      VALUES (
        ${correo}, 
        ${hash_contrasena}, 
        ${nombre}, 
        ${apellido}, 
        ${telefono || null}, 
        ${numero_documento}, 
        ${imagen_perfil || null}, 
        ${rol_id || null}, 
        true
      )
      RETURNING *
    `;

    return NextResponse.json(nuevoUsuario[0], { status: 201 });

  } catch (error) {

    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
