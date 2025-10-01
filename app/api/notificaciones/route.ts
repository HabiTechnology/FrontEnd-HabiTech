import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get("usuario_id")
    const soloNoLeidas = searchParams.get("solo_no_leidas") === "true"
    const limite = searchParams.get("limite") ? parseInt(searchParams.get("limite")!) : 50

    console.log("📬 Fetching notificaciones:", { usuarioId, soloNoLeidas, limite })

    let notificaciones: any[]

    if (usuarioId && soloNoLeidas) {
      notificaciones = await sql`
        SELECT 
          n.*,
          u.nombre as usuario_nombre,
          u.correo as usuario_correo
        FROM notificaciones n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        WHERE n.usuario_id = ${parseInt(usuarioId)}
          AND n.leido = false
        ORDER BY n.creado_en DESC
        LIMIT ${limite}
      `
    } else if (usuarioId) {
      notificaciones = await sql`
        SELECT 
          n.*,
          u.nombre as usuario_nombre,
          u.correo as usuario_correo
        FROM notificaciones n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        WHERE n.usuario_id = ${parseInt(usuarioId)}
        ORDER BY n.creado_en DESC
        LIMIT ${limite}
      `
    } else if (soloNoLeidas) {
      notificaciones = await sql`
        SELECT 
          n.*,
          u.nombre as usuario_nombre,
          u.correo as usuario_correo
        FROM notificaciones n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        WHERE n.leido = false
        ORDER BY n.creado_en DESC
        LIMIT ${limite}
      `
    } else {
      notificaciones = await sql`
        SELECT 
          n.*,
          u.nombre as usuario_nombre,
          u.correo as usuario_correo
        FROM notificaciones n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        ORDER BY n.creado_en DESC
        LIMIT ${limite}
      `
    }

    console.log(`✅ Found ${notificaciones.length} notificaciones`)

    // Calcular resumen
    const totalNoLeidas = notificaciones.filter((n: any) => !n.leido).length
    
    // Agrupar por tipo
    const porTipo: Record<string, number> = {}
    notificaciones.forEach((n: any) => {
      porTipo[n.tipo] = (porTipo[n.tipo] || 0) + 1
    })

    const resumen = {
      total: notificaciones.length,
      no_leidas: totalNoLeidas,
      por_tipo: Object.entries(porTipo).map(([tipo, cantidad]) => ({
        tipo,
        cantidad
      })),
      notificaciones
    }

    return NextResponse.json(resumen)
  } catch (error: any) {
    console.error("❌ Error fetching notificaciones:", error)
    return NextResponse.json(
      { 
        error: "Error al obtener notificaciones", 
        details: error.message,
        total: 0,
        no_leidas: 0,
        por_tipo: [],
        notificaciones: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario_id, titulo, mensaje, tipo, id_relacionado, icono, url_accion } = body

    console.log("📝 Creating notificacion:", body)

    // Validaciones
    if (!usuario_id || !titulo || !mensaje || !tipo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: usuario_id, titulo, mensaje, tipo" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO notificaciones (
        usuario_id, titulo, mensaje, tipo, id_relacionado, icono, url_accion
      )
      VALUES (
        ${usuario_id}, ${titulo}, ${mensaje}, ${tipo}, 
        ${id_relacionado || null}, ${icono || null}, ${url_accion || null}
      )
      RETURNING *
    `

    console.log("✅ Notificacion created:", result[0])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("❌ Error creating notificacion:", error)
    return NextResponse.json(
      { error: "Error al crear notificación", details: error.message },
      { status: 500 }
    )
  }
}
