
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/usuarios/[id] - Obtener usuario por id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
  const rows = await query`SELECT * FROM usuarios WHERE id = ${id}`;
    if (!rows[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const u = rows[0];
    const mapped = {
      id_residente: u.id,
      nombre: u.nombre,
      email: u.correo,
    };
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 });
  }
}

// PUT /api/usuarios/[id] - Actualizar usuario por id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await req.json();
    const { 
      nombre, 
      apellido,
      email,
      telefono,
      numero_documento,
      imagen_perfil,
      rol_id,
      activo 
    } = data;

    const rows = await query`
      UPDATE usuarios SET
        nombre = COALESCE(${nombre}, nombre),
        apellido = COALESCE(${apellido}, apellido),
        correo = COALESCE(${email}, correo),
        telefono = COALESCE(${telefono}, telefono),
        numero_documento = COALESCE(${numero_documento}, numero_documento),
        imagen_perfil = COALESCE(${imagen_perfil}, imagen_perfil),
        rol_id = COALESCE(${rol_id}, rol_id),
        activo = COALESCE(${activo}, activo),
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
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
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario por id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const rows = await query`DELETE FROM usuarios WHERE id = ${id} RETURNING *`;
    if (!rows[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}

