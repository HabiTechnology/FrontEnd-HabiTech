import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("📊 Obteniendo estadísticas de accesos...")
    
    // Debug: Ver la fecha actual del servidor
    const fechaActualResult = await sql`SELECT CURRENT_DATE as fecha_hoy, NOW() as ahora`
    console.log("🕐 Fecha del servidor:", fechaActualResult[0])
    
    // Debug: Ver algunas fechas de registros
    const muestraFechas = await sql`
      SELECT fecha_hora, fecha_hora::date as solo_fecha, tipo 
      FROM registros_acceso 
      ORDER BY fecha_hora DESC 
      LIMIT 5
    `
    console.log("📅 Muestra de fechas en DB:", muestraFechas)

    // Obtener estadísticas usando solo la tabla registros_acceso
    const estadisticas = {
      total_hoy: 0,
      entradas_hoy: 0,
      salidas_hoy: 0,
      total_mes: 0,
      accesos_por_hora: []
    }

    try {
      // Accesos de hoy - usar las últimas 24 horas en lugar de CURRENT_DATE
      const accesoHoyResult = await sql`
        SELECT COUNT(*) as total
        FROM registros_acceso
        WHERE fecha_hora >= NOW() - INTERVAL '24 hours'
      `
      estadisticas.total_hoy = parseInt(accesoHoyResult[0]?.total || '0')
      console.log("✅ Total hoy (últimas 24h):", estadisticas.total_hoy)
    } catch (e) {
      console.error("❌ Error obteniendo accesos de hoy:", e)
    }

    try {
      // Entradas de hoy (últimas 24 horas)
      const entradasHoyResult = await sql`
        SELECT COUNT(*) as total
        FROM registros_acceso
        WHERE fecha_hora >= NOW() - INTERVAL '24 hours'
        AND tipo = 'entrada'
      `
      estadisticas.entradas_hoy = parseInt(entradasHoyResult[0]?.total || '0')
      console.log("✅ Entradas hoy (últimas 24h):", estadisticas.entradas_hoy)
    } catch (e) {
      console.warn("⚠️ Error obteniendo entradas de hoy:", e)
    }

    try {
      // Salidas de hoy (últimas 24 horas)
      const salidasHoyResult = await sql`
        SELECT COUNT(*) as total
        FROM registros_acceso
        WHERE fecha_hora >= NOW() - INTERVAL '24 hours'
        AND tipo = 'salida'
      `
      estadisticas.salidas_hoy = parseInt(salidasHoyResult[0]?.total || '0')
      console.log("✅ Salidas hoy (últimas 24h):", estadisticas.salidas_hoy)
    } catch (e) {
      console.warn("⚠️ Error obteniendo salidas de hoy:", e)
    }

    try {
      // Total del mes
      const totalMesResult = await sql`
        SELECT COUNT(*) as total
        FROM registros_acceso
        WHERE EXTRACT(MONTH FROM fecha_hora) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha_hora) = EXTRACT(YEAR FROM CURRENT_DATE)
      `
      estadisticas.total_mes = parseInt(totalMesResult[0]?.total || '0')
      console.log("✅ Total mes:", estadisticas.total_mes)
    } catch (e) {
      console.warn("⚠️ Error obteniendo total del mes:", e)
    }

    console.log("✅ Estadísticas finales:", estadisticas)

    // Información de debug adicional
    const debug = {
      fecha_servidor: fechaActualResult[0],
      muestra_registros: muestraFechas,
      estadisticas: estadisticas
    }
    
    console.log("🔍 Debug completo:", JSON.stringify(debug, null, 2))

    return NextResponse.json({
      ...estadisticas,
      _debug: {
        fecha_servidor: fechaActualResult[0]?.fecha_hoy,
        timestamp_servidor: fechaActualResult[0]?.ahora,
        muestra_fechas: muestraFechas.map(r => ({
          id: r.id,
          fecha_hora: r.fecha_hora,
          solo_fecha: r.solo_fecha,
          tipo: r.tipo
        }))
      }
    })

  } catch (error: any) {
    console.error("❌ Error obteniendo estadísticas de accesos:", error)
    
    // Devolver estadísticas vacías en caso de error
    return NextResponse.json({
      total_hoy: 0,
      entradas_hoy: 0,
      salidas_hoy: 0,
      total_mes: 0,
      accesos_por_hora: [],
      error: error.message
    })
  }
}
