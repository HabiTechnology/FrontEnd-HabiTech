
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/usuarios/[id] - Obtener usuario por id
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
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
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    const data = await req.json();
    const { nombre, email } = data;
    const rows = await query`
      UPDATE usuarios SET
        nombre = ${nombre},
        correo = ${email}
      WHERE id = ${id}
      RETURNING *
    `;
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
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario por id
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
  const rows = await query`DELETE FROM usuarios WHERE id = ${id} RETURNING *`;
    if (!rows[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}

