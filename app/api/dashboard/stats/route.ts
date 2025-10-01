import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("📊 Fetching dashboard stats...")
    
    // Obtener estadísticas de residentes activos
    const residentesActivos = await sql`
      SELECT COUNT(DISTINCT r.id) as total
      FROM residentes r
      WHERE r.activo = true AND r.fecha_salida IS NULL
    `
    console.log("👥 Residentes activos:", residentesActivos)

    // Obtener ingresos mensuales (pagos de renta y mantenimiento del mes actual)
    const ingresosMensuales = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total
      FROM pagos
      WHERE 
        estado = 'pagado' 
        AND EXTRACT(MONTH FROM fecha_pago) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND tipo_pago IN ('renta', 'mantenimiento')
    `
    console.log("💰 Ingresos mensuales:", ingresosMensuales)

    // Obtener ocupación de departamentos
    const ocupacionDepartamentos = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE estado = 'ocupado') as ocupados,
        COUNT(*) as total
      FROM departamentos
      WHERE activo = true
    `
    console.log("🏢 Ocupación departamentos:", ocupacionDepartamentos)

    // Calcular porcentaje de ocupación
    const ocupados = Number(ocupacionDepartamentos[0]?.ocupados || 0)
    const totalDepartamentos = Number(ocupacionDepartamentos[0]?.total || 0)
    const porcentajeOcupacion = totalDepartamentos > 0 
      ? Math.round((ocupados / totalDepartamentos) * 100) 
      : 0

    // Obtener tendencias (comparar con mes anterior)
    const residentesMesAnterior = await sql`
      SELECT COUNT(DISTINCT r.id) as total
      FROM residentes r
      WHERE 
        r.activo = true 
        AND r.fecha_ingreso < DATE_TRUNC('month', CURRENT_DATE)
    `

    const ingresosMesAnterior = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total
      FROM pagos
      WHERE 
        estado = 'pagado'
        AND EXTRACT(MONTH FROM fecha_pago) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
        AND EXTRACT(YEAR FROM fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
        AND tipo_pago IN ('renta', 'mantenimiento')
    `

    const residentesTotal = Number(residentesActivos[0]?.total || 0)
    const residentesPrevio = Number(residentesMesAnterior[0]?.total || 0)
    const tendenciaResidentes = residentesPrevio > 0 
      ? ((residentesTotal - residentesPrevio) / residentesPrevio) * 100 
      : 0

    const ingresosTotal = Number(ingresosMensuales[0]?.total || 0)
    const ingresosPrevio = Number(ingresosMesAnterior[0]?.total || 0)
    const tendenciaIngresos = ingresosPrevio > 0 
      ? ((ingresosTotal - ingresosPrevio) / ingresosPrevio) * 100 
      : 0

    const response = {
      residentes: {
        total: residentesTotal,
        tendencia: tendenciaResidentes > 0 ? "up" : tendenciaResidentes < 0 ? "down" : "neutral",
        porcentaje: Math.abs(Math.round(tendenciaResidentes))
      },
      ingresos: {
        total: ingresosTotal,
        tendencia: tendenciaIngresos > 0 ? "up" : tendenciaIngresos < 0 ? "down" : "neutral",
        porcentaje: Math.abs(Math.round(tendenciaIngresos))
      },
      ocupacion: {
        porcentaje: porcentajeOcupacion,
        ocupados,
        total: totalDepartamentos
      }
    }

    console.log("✅ Sending dashboard stats response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas del dashboard" },
      { status: 500 }
    )
  }
}
