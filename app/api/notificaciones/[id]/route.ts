import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { leido } = body

    console.log(`📬 Marking notificacion ${id} as ${leido ? 'read' : 'unread'}`)

    const result = await sql`
      UPDATE notificaciones
      SET 
        leido = ${leido},
        leido_en = ${leido ? new Date().toISOString() : null}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      )
    }

    console.log("✅ Notificacion updated:", result[0])

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("❌ Error updating notificacion:", error)
    return NextResponse.json(
      { error: "Error al actualizar notificación", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    console.log(`🗑️ Deleting notificacion ${id}`)

    const result = await sql`
      DELETE FROM notificaciones
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      )
    }

    console.log("✅ Notificacion deleted")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error deleting notificacion:", error)
    return NextResponse.json(
      { error: "Error al eliminar notificación", details: error.message },
      { status: 500 }
    )
  }
}
