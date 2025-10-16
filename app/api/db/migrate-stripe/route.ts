import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔧 Ejecutando migración: Agregar columna stripe_payment_intent_id a pagos...');

    // Verificar si la columna ya existe
    const checkColumn = await query`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pagos' 
      AND column_name = 'stripe_payment_intent_id'
    `;

    if (checkColumn.length > 0) {
      console.log('✅ La columna stripe_payment_intent_id ya existe');
      return NextResponse.json({
        success: true,
        message: 'La columna stripe_payment_intent_id ya existe en la tabla pagos',
      });
    }

    // Agregar la columna
    await query`
      ALTER TABLE pagos 
      ADD COLUMN stripe_payment_intent_id VARCHAR(255)
    `;

    console.log('✅ Columna stripe_payment_intent_id agregada correctamente');

    // Crear índice para búsquedas más rápidas
    await query`
      CREATE INDEX IF NOT EXISTS idx_pagos_stripe_payment_intent 
      ON pagos(stripe_payment_intent_id)
    `;

    console.log('✅ Índice creado para stripe_payment_intent_id');

    return NextResponse.json({
      success: true,
      message: 'Migración completada: columna stripe_payment_intent_id agregada exitosamente',
    });

  } catch (error) {
    console.error('❌ Error en migración:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al ejecutar la migración',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
