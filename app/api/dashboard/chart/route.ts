import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "semana" // semana, mes, año

    let dias = 7
    let formato = "DD/MM"

    if (periodo === "mes") {
      dias = 30
      formato = "DD/MM"
    } else if (periodo === "año") {
      dias = 365
      formato = "Mon"
    }

    // Calcular fecha inicial
    const fechaInicial = new Date()
    fechaInicial.setDate(fechaInicial.getDate() - dias)

    // Para año, necesitamos datos mensuales, no diarios
    if (periodo === "año") {
      // Obtener datos mensuales de los últimos 12 meses
      const residentesData = await sql`
        WITH meses AS (
          SELECT 
            date_trunc('month', generate_series(
              CURRENT_DATE - INTERVAL '12 months',
              CURRENT_DATE,
              INTERVAL '1 month'
            )) as fecha
        )
        SELECT 
          TO_CHAR(m.fecha, 'Mon') as fecha,
          COUNT(DISTINCT r.id) as total
        FROM meses m
        LEFT JOIN residentes r ON 
          r.fecha_ingreso <= m.fecha AND 
          (r.fecha_salida IS NULL OR r.fecha_salida >= m.fecha) AND
          r.activo = true
        GROUP BY m.fecha
        ORDER BY m.fecha
      `

      const visitantesData = await sql`
        WITH meses AS (
          SELECT 
            date_trunc('month', generate_series(
              CURRENT_DATE - INTERVAL '12 months',
              CURRENT_DATE,
              INTERVAL '1 month'
            )) as fecha
        )
        SELECT 
          TO_CHAR(m.fecha, 'Mon') as fecha,
          COUNT(*) as total
        FROM meses m
        LEFT JOIN registros_acceso ra ON 
          date_trunc('month', ra.fecha_hora) = m.fecha AND
          ra.tipo = 'entrada' AND
          ra.usuario_id NOT IN (SELECT usuario_id FROM residentes WHERE activo = true)
        GROUP BY m.fecha
        ORDER BY m.fecha
      `

      const ingresosData = await sql`
        WITH meses AS (
          SELECT 
            date_trunc('month', generate_series(
              CURRENT_DATE - INTERVAL '12 months',
              CURRENT_DATE,
              INTERVAL '1 month'
            )) as fecha
        )
        SELECT 
          TO_CHAR(m.fecha, 'Mon') as fecha,
          COALESCE(SUM(p.monto), 0) as total
        FROM meses m
        LEFT JOIN pagos p ON 
          date_trunc('month', p.fecha_pago) = m.fecha AND
          p.estado = 'pagado'
        GROUP BY m.fecha
        ORDER BY m.fecha
      `

      return NextResponse.json({
        labels: residentesData.map((item) => item.fecha),
        datasets: {
          residentes: residentesData.map((item) => Number(item.total)),
          visitantes: visitantesData.map((item) => Number(item.total)),
          ingresos: ingresosData.map((item) => Number(item.total))
        }
      })
    }

    // Para semana y mes, usar datos diarios
    // Calcular fechas en JavaScript para evitar problemas con parámetros SQL
    const fechaFin = new Date()
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - dias)

    const residentesData = await sql`
      WITH dias AS (
        SELECT 
          generate_series(
            ${fechaInicio.toISOString().split('T')[0]}::date,
            ${fechaFin.toISOString().split('T')[0]}::date,
            '1 day'::interval
          )::date as fecha
      )
      SELECT 
        TO_CHAR(d.fecha, ${formato}) as fecha,
        COUNT(DISTINCT r.id) as total
      FROM dias d
      LEFT JOIN residentes r ON 
        r.fecha_ingreso <= d.fecha AND 
        (r.fecha_salida IS NULL OR r.fecha_salida >= d.fecha) AND
        r.activo = true
      GROUP BY d.fecha
      ORDER BY d.fecha
    `

    const visitantesData = await sql`
      WITH dias AS (
        SELECT 
          generate_series(
            ${fechaInicio.toISOString().split('T')[0]}::date,
            ${fechaFin.toISOString().split('T')[0]}::date,
            '1 day'::interval
          )::date as fecha
      )
      SELECT 
        TO_CHAR(d.fecha, ${formato}) as fecha,
        COUNT(*) as total
      FROM dias d
      LEFT JOIN registros_acceso ra ON 
        DATE(ra.fecha_hora) = d.fecha AND
        ra.tipo = 'entrada' AND
        ra.usuario_id NOT IN (SELECT usuario_id FROM residentes WHERE activo = true)
      GROUP BY d.fecha
      ORDER BY d.fecha
    `

    const ingresosData = await sql`
      WITH dias AS (
        SELECT 
          generate_series(
            ${fechaInicio.toISOString().split('T')[0]}::date,
            ${fechaFin.toISOString().split('T')[0]}::date,
            '1 day'::interval
          )::date as fecha
      )
      SELECT 
        TO_CHAR(d.fecha, ${formato}) as fecha,
        COALESCE(SUM(p.monto), 0) as total
      FROM dias d
      LEFT JOIN pagos p ON 
        DATE(p.fecha_pago) = d.fecha AND
        p.estado = 'pagado'
      GROUP BY d.fecha
      ORDER BY d.fecha
    `

    return NextResponse.json({
      labels: residentesData.map((item) => item.fecha),
      datasets: {
        residentes: residentesData.map((item) => Number(item.total)),
        visitantes: visitantesData.map((item) => Number(item.total)),
        ingresos: ingresosData.map((item) => Number(item.total))
      }
    })
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json(
      { error: "Error al obtener datos del gráfico" },
      { status: 500 }
    )
  }
}
