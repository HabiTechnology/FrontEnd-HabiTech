import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    console.log("🏗️ Creando tabla pagos y datos de prueba...")

    // Crear tabla pagos si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        residente_id INTEGER REFERENCES residentes(id),
        departamento_id INTEGER REFERENCES departamentos(id),
        monto DECIMAL(10, 2) NOT NULL,
        tipo_pago VARCHAR(50) NOT NULL,
        estado VARCHAR(50) NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        fecha_pago DATE,
        metodo_pago VARCHAR(50),
        referencia VARCHAR(255),
        notas TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("✅ Tabla pagos creada")

    // Verificar si ya hay pagos
    const existingCount = await sql`SELECT COUNT(*) as total FROM pagos`
    
    if (existingCount[0].total > 0) {
      return NextResponse.json({
        success: true,
        message: "La tabla pagos ya tiene datos",
        total: existingCount[0].total
      })
    }

    // Obtener residentes y departamentos para crear pagos
    const residentes = await sql`SELECT id, departamento_id FROM residentes LIMIT 5`
    const departamentos = await sql`SELECT id FROM departamentos LIMIT 5`

    if (residentes.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No hay residentes en la base de datos. Crea residentes primero."
      }, { status: 400 })
    }

    // Crear pagos de prueba
    const tiposPago = ['renta', 'mantenimiento', 'multa', 'deposito']
    const estados = ['pagado', 'pendiente', 'atrasado']
    const metodosPago = ['efectivo', 'transferencia', 'tarjeta']

    const pagosCreados = []

    for (let i = 0; i < Math.min(10, residentes.length); i++) {
      const residente = residentes[i % residentes.length]
      const tipo = tiposPago[i % tiposPago.length]
      const estado = estados[i % estados.length]
      const metodo = metodosPago[i % metodosPago.length]
      
      // Montos según tipo
      const montos: Record<string, number> = {
        renta: 15000 + (i * 1000),
        mantenimiento: 3000 + (i * 200),
        multa: 500 + (i * 100),
        deposito: 20000 + (i * 2000)
      }

      const monto = montos[tipo]
      
      // Fechas
      const fechaVencimiento = new Date(2025, 0, 15 + i) // Enero 2025
      const fechaPago = estado === 'pagado' ? new Date(2025, 0, 10 + i) : null

      const [pago] = await sql`
        INSERT INTO pagos (
          residente_id,
          departamento_id,
          monto,
          tipo_pago,
          estado,
          fecha_vencimiento,
          fecha_pago,
          metodo_pago,
          referencia,
          notas
        ) VALUES (
          ${residente.id},
          ${residente.departamento_id},
          ${monto},
          ${tipo},
          ${estado},
          ${fechaVencimiento.toISOString().split('T')[0]},
          ${fechaPago ? fechaPago.toISOString().split('T')[0] : null},
          ${estado === 'pagado' ? metodo : null},
          ${estado === 'pagado' ? `REF-${Date.now()}-${i}` : null},
          ${`Pago de ${tipo} ${estado === 'pagado' ? 'completado' : 'pendiente'}`}
        )
        RETURNING *
      `

      pagosCreados.push(pago)
      console.log(`✅ Pago ${i + 1} creado:`, pago.id)
    }

    console.log(`✅ ${pagosCreados.length} pagos de prueba creados`)

    return NextResponse.json({
      success: true,
      message: `Tabla pagos creada y ${pagosCreados.length} pagos de prueba insertados`,
      pagos: pagosCreados
    })

  } catch (error) {
    console.error("❌ Error creando tabla pagos:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET para verificar estructura
export async function GET() {
  try {
    const estructura = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'pagos'
      ORDER BY ordinal_position
    `

    const count = await sql`SELECT COUNT(*) as total FROM pagos`

    return NextResponse.json({
      success: true,
      estructura,
      total_pagos: count[0]?.total || 0
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
