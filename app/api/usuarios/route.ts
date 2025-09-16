
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/usuarios - Listar todos los usuarios
export async function GET(req: NextRequest) {
  try {
    const rows = await query`SELECT * FROM usuarios ORDER BY id ASC`;
    const mapped = rows.map((u: any) => ({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.correo,
      telefono: u.telefono,
      numero_documento: u.numero_documento,
      imagen_perfil: u.imagen_perfil,
      rol_id: u.rol_id,
      activo: u.activo,
      creado_en: u.creado_en,
      actualizado_en: u.actualizado_en
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 });
  }
}

// POST /api/usuarios - Crear un nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      nombre, 
      apellido,
      email, 
      contrasena,
      telefono,
      numero_documento,
      imagen_perfil,
      rol_id 
    } = data;

    // Validaciones
    if (!contrasena) {
      return NextResponse.json({ error: 'La contraseña es requerida' }, { status: 400 });
    }
    if (!nombre || !apellido || !email || !numero_documento) {
      return NextResponse.json({ error: 'Nombre, apellido, email y número de documento son requeridos' }, { status: 400 });
    }

    // Hash de la contraseña
    const hash_contrasena = await bcrypt.hash(contrasena, 10);

    const rows = await query`
      INSERT INTO usuarios (
        nombre, 
        apellido,
        correo, 
        hash_contrasena,
        telefono,
        numero_documento,
        imagen_perfil,
        rol_id,
        activo
      )
      VALUES (
        ${nombre}, 
        ${apellido},
        ${email}, 
        ${hash_contrasena},
        ${telefono || null},
        ${numero_documento},
        ${imagen_perfil || null},
        ${rol_id || null},
        ${true}
      )
      RETURNING *
    `;
    
    const u = rows[0];
    const mapped = {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.correo,
      telefono: u.telefono,
      numero_documento: u.numero_documento,
      imagen_perfil: u.imagen_perfil,
      rol_id: u.rol_id,
      activo: u.activo,
      creado_en: u.creado_en,
      actualizado_en: u.actualizado_en
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}

// PUT no permitido en la colección
export async function PUT() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

// DELETE no permitido en la colección
export async function DELETE() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}
