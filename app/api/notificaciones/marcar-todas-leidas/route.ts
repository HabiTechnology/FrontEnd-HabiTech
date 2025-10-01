import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario_id } = body

    if (!usuario_id) {
      return NextResponse.json(
        { error: "Se requiere usuario_id" },
        { status: 400 }
      )
    }

    console.log(`📬 Marking all notificaciones as read for user ${usuario_id}`)

    const result = await sql`
      UPDATE notificaciones
      SET 
        leido = true,
        leido_en = CURRENT_TIMESTAMP
      WHERE usuario_id = ${parseInt(usuario_id)}
        AND leido = false
      RETURNING id
    `

    console.log(`✅ Marked ${result.length} notificaciones as read`)

    return NextResponse.json({ 
      success: true, 
      count: result.length 
    })
  } catch (error: any) {
    console.error("❌ Error marking all as read:", error)
    return NextResponse.json(
      { error: "Error al marcar notificaciones como leídas", details: error.message },
      { status: 500 }
    )
  }
}
