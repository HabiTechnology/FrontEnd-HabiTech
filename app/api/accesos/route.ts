import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🔍 Obteniendo registros de acceso...")

    // Obtener todos los registros de acceso con información del usuario y departamento
    // JOIN con residentes para obtener el número de departamento
    const registros = await sql`
      SELECT 
        ra.id,
        ra.usuario_id,
        ra.dispositivo_id,
        ra.tipo,
        ra.fecha_hora,
        COALESCE(u.nombre, 'Usuario') as usuario_nombre,
        COALESCE(u.apellido, 'Desconocido') as usuario_apellido,
        d.numero as departamento_numero
      FROM registros_acceso ra
      LEFT JOIN usuarios u ON ra.usuario_id = u.id
      LEFT JOIN residentes r ON u.id = r.usuario_id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      ORDER BY ra.fecha_hora DESC
      LIMIT 500
    `

    console.log(`✅ ${registros.length} registros encontrados`)

    return NextResponse.json({
      success: true,
      registros: registros,
      total: registros.length
    })

  } catch (error: any) {
    console.error("❌ Error obteniendo registros de acceso:", error)
    
    // Si hay error de base de datos, devolver array vacío en lugar de error
    return NextResponse.json({
      success: false,
      registros: [],
      total: 0,
      error: error.message
    })
  }
}
