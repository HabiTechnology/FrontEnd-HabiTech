
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/usuarios - Listar todos los usuarios
export async function GET(req: NextRequest) {
  try {
    const rows = await query`SELECT * FROM usuarios ORDER BY id ASC`;
    const mapped = rows.map((u: any) => ({
      id_residente: u.id,
      nombre: u.nombre,
      email: u.correo,
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
    const { nombre, email } = data;
    const rows = await query`
      INSERT INTO usuarios (nombre, correo)
      VALUES (${nombre}, ${email})
      RETURNING *
    `;
    const u = rows[0];
    const mapped = {
      id_residente: u.id,
      nombre: u.nombre,
      email: u.correo,
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

// Handler para /api/usuarios/[id]
// DELETE no permitido en la colección
export async function DELETE() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}
