import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendAnuncioEmail } from "@/lib/email-service"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Verificar conexión a BD
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL no está configurada en las variables de entorno");
    }

    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get("usuario_id")
    const soloNoLeidas = searchParams.get("solo_no_leidas") === "true"
    const limite = searchParams.get("limite") ? parseInt(searchParams.get("limite")!) : 50

    console.log("📬 Fetching notificaciones:", { usuarioId, soloNoLeidas, limite })

    let notificaciones: any[]

    try {
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
    } catch (dbError: any) {
      console.error("❌ Error en query de base de datos:", dbError.message)
      
      // Si las tablas no existen, devolver datos vacíos en lugar de error
      if (dbError.message.includes("does not exist") || dbError.message.includes("relation")) {
        console.warn("⚠️ Tabla 'notificaciones' o 'usuarios' no existe, devolviendo datos vacíos")
        return NextResponse.json({
          total: 0,
          no_leidas: 0,
          por_tipo: [],
          notificaciones: []
        })
      }
      
      throw dbError
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

    // Si es un anuncio, enviar también por email
    if (tipo === "anuncio") {
      try {
        // Obtener información del usuario (email y nombre)
        const usuario = await sql`
          SELECT u.correo, u.nombre, u.apellido
          FROM usuarios u
          WHERE u.id = ${usuario_id}
        `

        if (usuario.length > 0 && usuario[0].correo) {
          const nombreCompleto = `${usuario[0].nombre || ""} ${usuario[0].apellido || ""}`.trim() || "Residente"
          
          console.log(`📧 Enviando email de anuncio a ${usuario[0].correo}`)
          
          const emailResult = await sendAnuncioEmail(
            usuario[0].correo,
            nombreCompleto,
            titulo,
            mensaje
          )

          if (emailResult.success) {
            console.log(`✅ Email enviado exitosamente a ${usuario[0].correo}`)
          } else {
            console.warn(`⚠️ No se pudo enviar email a ${usuario[0].correo}:`, emailResult.error)
          }
        } else {
          console.warn(`⚠️ Usuario ${usuario_id} no tiene correo registrado`)
        }
      } catch (emailError: any) {
        // No fallar la creación de notificación si falla el email
        console.error("❌ Error enviando email de anuncio:", emailError)
      }
    }

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("❌ Error creating notificacion:", error)
    return NextResponse.json(
      { error: "Error al crear notificación", details: error.message },
      { status: 500 }
    )
  }
}
