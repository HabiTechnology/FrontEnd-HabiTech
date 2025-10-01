import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Running financial diagnostics...")

    // Verificar pagos
    const totalPagos = await sql`SELECT COUNT(*) as count, SUM(monto) as total FROM pagos`
    console.log("💳 Total pagos en DB:", totalPagos)

    const pagosPagados = await sql`SELECT COUNT(*) as count, SUM(monto) as total FROM pagos WHERE estado = 'pagado'`
    console.log("✅ Pagos pagados:", pagosPagados)

    const pagosPendientes = await sql`SELECT COUNT(*) as count, SUM(monto) as total FROM pagos WHERE estado = 'pendiente'`
    console.log("⏳ Pagos pendientes:", pagosPendientes)

    // Verificar personal
    const totalPersonal = await sql`SELECT COUNT(*) as count, SUM(salario) as total FROM personal_edificio WHERE activo = true`
    console.log("👷 Personal activo:", totalPersonal)

    // Verificar mantenimiento
    const totalMantenimiento = await sql`SELECT COUNT(*) as count, SUM(costo_estimado) as total FROM solicitudes_mantenimiento`
    console.log("🔧 Solicitudes mantenimiento:", totalMantenimiento)

    // Verificar métricas de consumo
    const totalConsumo = await sql`SELECT tipo_servicio, COUNT(*) as count, SUM(consumo) as total FROM metricas_consumo GROUP BY tipo_servicio`
    console.log("⚡ Métricas de consumo:", totalConsumo)

    return NextResponse.json({
      success: true,
      diagnostics: {
        pagos: {
          total: totalPagos[0],
          pagados: pagosPagados[0],
          pendientes: pagosPendientes[0]
        },
        personal: totalPersonal[0],
        mantenimiento: totalMantenimiento[0],
        consumo: totalConsumo
      }
    })

  } catch (error) {
    console.error("❌ Error in diagnostics:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error en diagnóstico" },
      { status: 500 }
    )
  }
}
