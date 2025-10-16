import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { residenteId, pdfHash } = await request.json();

    if (!residenteId) {
      return NextResponse.json(
        { error: 'residenteId es requerido' },
        { status: 400 }
      );
    }

    // Generar token único de 32 bytes (64 caracteres hex)
    const token = crypto.randomBytes(32).toString('hex');

    // Calcular fecha de expiración (30 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insertar token en la base de datos
    await query`
      INSERT INTO nft_claim_tokens (
        token,
        residente_id,
        pdf_hash,
        expires_at,
        created_at
      ) VALUES (
        ${token},
        ${residenteId},
        ${pdfHash || null},
        ${expiresAt},
        NOW()
      )
    `;

    // Construir URL del QR (forzar localhost en desarrollo)
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_APP_URL?.includes('habitech.app');
    const appUrl = isDevelopment ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL;
    const qrUrl = `${appUrl}/claim-nft?token=${token}`;

    console.log('✅ Token generado:', {
      token,
      residenteId,
      expiresAt: expiresAt.toISOString(),
      qrUrl
    });

    return NextResponse.json({
      success: true,
      token,
      qrUrl,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Error generando token:', error);
    return NextResponse.json(
      { error: 'Error al generar token' },
      { status: 500 }
    );
  }
}
