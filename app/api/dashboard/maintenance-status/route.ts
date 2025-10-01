import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔧 Fetching maintenance status...")

    // Obtener estado de solicitudes de mantenimiento
    const result = await sql`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM solicitudes_mantenimiento
      GROUP BY estado
      ORDER BY cantidad DESC
    `

    // Calcular total
    const total = result.reduce((sum: number, item: any) => sum + parseInt(item.cantidad), 0)

    console.log("🔧 Maintenance status result:", result)
    console.log("🔧 Total requests:", total)

    return NextResponse.json({
      success: true,
      data: result,
      total
    })

  } catch (error) {
    console.error("❌ Error in maintenance-status API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener estado de mantenimiento",
        data: [],
        total: 0
      },
      { status: 500 }
    )
  }
}
