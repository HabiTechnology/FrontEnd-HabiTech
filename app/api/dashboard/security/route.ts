import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Obtener estado de cámaras de seguridad
    const camarasSeguridad = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE estado = 'activo') as operativas,
        COUNT(*) as total
      FROM dispositivos_seguridad
      WHERE tipo = 'cctv'
    `

    // Obtener estado de control de acceso
    const controlAcceso = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE estado = 'activo') as operativas,
        COUNT(*) as total
      FROM dispositivos_seguridad
      WHERE tipo = 'control_acceso'
    `

    // Obtener sensores de humo con problemas
    const sensoresHumo = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE estado = 'inactivo' OR estado = 'fallo') as problemas,
        COUNT(*) as total
      FROM sensores_iot
      WHERE tipo = 'humo'
    `

    // Obtener incidentes recientes (últimas 24 horas)
    const incidentesRecientes = await sql`
      SELECT COUNT(*) as total
      FROM incidentes_emergencias
      WHERE fecha >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `

    const camaras = camarasSeguridad[0]
    const acceso = controlAcceso[0]
    const humo = sensoresHumo[0]
    
    const camarasOperativas = Number(camaras?.operativas || 0)
    const camarasTotal = Number(camaras?.total || 0)
    const accesoOperativo = Number(acceso?.operativas || 0)
    const accesoTotal = Number(acceso?.total || 0)
    const sensoresProblemas = Number(humo?.problemas || 0)
    const incidentes = Number(incidentesRecientes[0]?.total || 0)

    return NextResponse.json({
      camaras: {
        operativas: camarasOperativas,
        total: camarasTotal,
        porcentaje: camarasTotal > 0 
          ? Math.round((camarasOperativas / camarasTotal) * 100) 
          : 100,
        estado: camarasOperativas === camarasTotal ? "OPERATIVAS" : "REVISAR"
      },
      controlAcceso: {
        operativas: accesoOperativo,
        total: accesoTotal,
        porcentaje: accesoTotal > 0 
          ? Math.round((accesoOperativo / accesoTotal) * 100) 
          : 100,
        estado: accesoOperativo === accesoTotal ? "ACTIVO" : "REVISAR"
      },
      sensoresHumo: {
        problemas: sensoresProblemas,
        estado: sensoresProblemas === 0 ? "OPERATIVO" : "MANTENIMIENTO",
        mensaje: sensoresProblemas === 0 
          ? "Todos los sensores operativos" 
          : `${sensoresProblemas} sensor(es) requiere(n) atención`
      },
      incidentesRecientes: {
        total: incidentes,
        ultimasHoras: 24
      }
    })
  } catch (error) {
    console.error("Error fetching security data:", error)
    return NextResponse.json(
      { error: "Error al obtener datos de seguridad" },
      { status: 500 }
    )
  }
}
