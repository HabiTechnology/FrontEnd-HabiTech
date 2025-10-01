import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'mes' // mes, trimestre, año
    
    console.log(`💰 Fetching financial summary for periodo: ${periodo}`)

    let dateFilter = "DATE_TRUNC('month', CURRENT_DATE)"
    if (periodo === 'trimestre') {
      dateFilter = "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'"
    } else if (periodo === 'año') {
      dateFilter = "DATE_TRUNC('year', CURRENT_DATE)"
    }

    // Total de ingresos por pagos (sin filtro de fecha para ver todos)
    const ingresosPagos = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total,
        COUNT(*) as cantidad
      FROM pagos
      WHERE estado = 'pagado'
    `
    
    console.log("💳 Ingresos pagos raw:", ingresosPagos)

    // Desglose de ingresos por tipo (sin filtro de fecha)
    const ingresosPorTipo = await sql`
      SELECT 
        tipo_pago,
        COALESCE(SUM(monto), 0) as total,
        COUNT(*) as cantidad
      FROM pagos
      WHERE estado = 'pagado'
      GROUP BY tipo_pago
      ORDER BY total DESC
    `
    
    console.log("💳 Ingresos por tipo:", ingresosPorTipo)

    // Gastos en servicios (estimado basado en consumo) - sin filtro de fecha
    const gastosServicios = await sql`
      SELECT 
        tipo_servicio,
        COALESCE(SUM(consumo), 0) as total_consumo,
        COUNT(*) as registros
      FROM metricas_consumo
      GROUP BY tipo_servicio
    `
    
    console.log("⚡ Gastos servicios:", gastosServicios)

    // Gastos en mantenimiento - sin filtro de fecha
    const gastosMantenimiento = await sql`
      SELECT 
        COALESCE(SUM(costo_estimado), 0) as total
      FROM solicitudes_mantenimiento
      WHERE estado IN ('completado', 'en_progreso')
    `
    
    console.log("🔧 Gastos mantenimiento:", gastosMantenimiento)

    // Gastos en salarios del personal
    const gastosPersonal = await sql`
      SELECT 
        COALESCE(SUM(salario), 0) as total,
        COUNT(*) as cantidad
      FROM personal_edificio
      WHERE activo = true
    `
    
    console.log("👷 Gastos personal:", gastosPersonal)

    // Pagos pendientes
    const pagosPendientes = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total,
        COUNT(*) as cantidad
      FROM pagos
      WHERE estado = 'pendiente'
      AND fecha_vencimiento >= CURRENT_DATE
    `

    // Pagos vencidos
    const pagosVencidos = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total,
        COUNT(*) as cantidad
      FROM pagos
      WHERE estado = 'pendiente'
      AND fecha_vencimiento < CURRENT_DATE
    `

    // Calcular totales
    const totalIngresos = parseFloat(ingresosPagos[0].total || 0)
    const totalGastosMantenimiento = parseFloat(gastosMantenimiento[0].total || 0)
    const totalGastosPersonal = parseFloat(gastosPersonal[0].total || 0)
    
    // Estimar costos de servicios (tarifa aproximada)
    const tarifaAgua = 3.5 // por m³
    const tarifaGas = 0.8 // por m³
    const tarifaLuz = 0.12 // por kWh
    
    let totalGastosServicios = 0
    gastosServicios.forEach((servicio: any) => {
      const consumo = parseFloat(servicio.total_consumo || 0)
      if (servicio.tipo_servicio === 'agua') {
        totalGastosServicios += consumo * tarifaAgua
      } else if (servicio.tipo_servicio === 'gas') {
        totalGastosServicios += consumo * tarifaGas
      } else if (servicio.tipo_servicio === 'luz') {
        totalGastosServicios += consumo * tarifaLuz
      }
    })

    const totalGastos = totalGastosMantenimiento + totalGastosPersonal + totalGastosServicios
    const balanceNeto = totalIngresos - totalGastos

    const resultado = {
      periodo,
      ingresos: {
        total: totalIngresos,
        cantidad: parseInt(ingresosPagos[0].cantidad || 0),
        porTipo: ingresosPorTipo.map((item: any) => ({
          tipo: item.tipo_pago,
          total: parseFloat(item.total || 0),
          cantidad: parseInt(item.cantidad || 0)
        }))
      },
      gastos: {
        total: totalGastos,
        mantenimiento: {
          total: totalGastosMantenimiento,
          descripcion: "Reparaciones y mantenimiento"
        },
        personal: {
          total: totalGastosPersonal,
          cantidad: parseInt(gastosPersonal[0].cantidad || 0),
          descripcion: "Salarios del personal"
        },
        servicios: {
          total: totalGastosServicios,
          desglose: gastosServicios.map((s: any) => ({
            tipo: s.tipo_servicio,
            consumo: parseFloat(s.total_consumo || 0),
            registros: parseInt(s.registros || 0)
          }))
        }
      },
      balance: {
        neto: balanceNeto,
        porcentaje: totalIngresos > 0 ? ((balanceNeto / totalIngresos) * 100).toFixed(2) : 0
      },
      pendientes: {
        total: parseFloat(pagosPendientes[0].total || 0),
        cantidad: parseInt(pagosPendientes[0].cantidad || 0)
      },
      vencidos: {
        total: parseFloat(pagosVencidos[0].total || 0),
        cantidad: parseInt(pagosVencidos[0].cantidad || 0)
      }
    }

    console.log("💰 Financial summary result:", resultado)

    return NextResponse.json(resultado)

  } catch (error) {
    console.error("❌ Error in financial summary API:", error)
    
    // Devolver estructura vacía pero válida en caso de error
    return NextResponse.json({
      periodo: 'mes',
      ingresos: {
        total: 0,
        cantidad: 0,
        porTipo: []
      },
      gastos: {
        total: 0,
        mantenimiento: {
          total: 0,
          descripcion: "Reparaciones y mantenimiento"
        },
        personal: {
          total: 0,
          cantidad: 0,
          descripcion: "Salarios del personal"
        },
        servicios: {
          total: 0,
          desglose: []
        }
      },
      balance: {
        neto: 0,
        porcentaje: 0
      },
      pendientes: {
        total: 0,
        cantidad: 0
      },
      vencidos: {
        total: 0,
        cantidad: 0
      },
      error: error instanceof Error ? error.message : "Error al obtener resumen financiero"
    }, { status: 500 })
  }
}
