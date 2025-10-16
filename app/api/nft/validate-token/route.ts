import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Buscar token en la base de datos
    const result = await sql`
      SELECT 
        id,
        token,
        residente_id as "residenteId",
        usado,
        expires_at as "expiresAt",
        created_at as "createdAt"
      FROM nft_claim_tokens
      WHERE token = ${token}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Token no encontrado' },
        { status: 404 }
      );
    }

    const tokenData = result[0];

    // Verificar si ya fue usado
    if (tokenData.usado) {
      return NextResponse.json(
        { error: 'Este token ya fue utilizado' },
        { status: 400 }
      );
    }

    // Verificar si expiró
    const now = new Date();
    const expiresAt = new Date(tokenData.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Este token ha expirado' },
        { status: 400 }
      );
    }

    // Token válido
    return NextResponse.json({
      valid: true,
      residenteId: tokenData.residenteId,
      expiresAt: tokenData.expiresAt,
      createdAt: tokenData.createdAt,
    });

  } catch (error) {
    console.error('Error validando token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
