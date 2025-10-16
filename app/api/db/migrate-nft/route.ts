import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    // Crear tabla nft_claim_tokens si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS nft_claim_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        residente_id INTEGER NOT NULL,
        pdf_hash VARCHAR(128),
        usado BOOLEAN DEFAULT FALSE,
        wallet_address VARCHAR(42),
        nft_token_id INTEGER,
        transaction_hash VARCHAR(66),
        expires_at TIMESTAMP NOT NULL,
        claimed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear índices para optimizar búsquedas
    await sql`
      CREATE INDEX IF NOT EXISTS idx_nft_tokens_token ON nft_claim_tokens(token)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_nft_tokens_residente ON nft_claim_tokens(residente_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_nft_tokens_usado ON nft_claim_tokens(usado)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_nft_tokens_expires ON nft_claim_tokens(expires_at)
    `;

    return NextResponse.json({
      success: true,
      message: 'Tabla nft_claim_tokens creada exitosamente con índices'
    });
  } catch (error: unknown) {
    console.error('Error en migración NFT:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear tabla',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
