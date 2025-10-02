import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Verificando tabla pagos...")

    // Verificar si la tabla pagos existe y tiene datos
    const pagos = await sql`SELECT * FROM pagos LIMIT 5`
    
    console.log("✅ Pagos encontrados:", pagos.length)
    console.log("📊 Datos:", pagos)

    // Verificar estructura de la tabla
    const estructura = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pagos'
      ORDER BY ordinal_position
    `

    return NextResponse.json({
      success: true,
      total_pagos: pagos.length,
      pagos: pagos,
      estructura_tabla: estructura
    })

  } catch (error) {
    console.error("❌ Error verificando pagos:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
