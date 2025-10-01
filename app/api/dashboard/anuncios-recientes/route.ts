import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("📢 Fetching recent announcements...")

    // Obtener los últimos 8 anuncios
    const result = await sql`
      SELECT 
        a.id,
        a.titulo,
        a.contenido,
        a.tipo,
        a.prioridad,
        a.fecha_publicacion,
        a.activo,
        u.nombre || ' ' || u.apellido as autor
      FROM anuncios a
      LEFT JOIN usuarios u ON a.creado_por = u.id
      WHERE a.activo = true
      ORDER BY a.fecha_publicacion DESC
      LIMIT 8
    `

    console.log("📢 Recent announcements result:", result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Error in anuncios-recientes API:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error al obtener anuncios recientes",
        data: []
      },
      { status: 500 }
    )
  }
}
