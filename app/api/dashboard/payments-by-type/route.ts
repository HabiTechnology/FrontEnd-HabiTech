import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("💰 Fetching payments by type...")

    // Obtener pagos del mes actual agrupados por tipo
    const result = await sql`
      SELECT 
        tipo_pago as tipo,
        SUM(monto) as total,
        COUNT(*) as cantidad
      FROM pagos
      WHERE 
        estado = 'pagado' 
        AND fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
        AND fecha_pago < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      GROUP BY tipo_pago
      ORDER BY total DESC
    `

    console.log("💰 Payments by type result:", result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in payments-by-type API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener pagos por tipo",
        data: []
      },
      { status: 500 }
    )
  }
}
