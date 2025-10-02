import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log("💰 Obteniendo estadísticas financieras...");

    // Ingresos del mes actual
    const ingresosMes = await sql`
      SELECT 
        COALESCE(SUM(monto), 0) as total_ingresos,
        COUNT(*) as total_pagos,
        COUNT(*) FILTER (WHERE estado = 'pagado') as pagos_completados,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pagos_pendientes,
        COUNT(*) FILTER (WHERE estado = 'atrasado') as pagos_atrasados,
        COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as ingresos_confirmados,
        COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) as ingresos_pendientes
      FROM pagos
      WHERE EXTRACT(MONTH FROM creado_en) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM creado_en) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;

    // Desglose por tipo de pago
    const porTipo = await sql`
      SELECT 
        tipo_pago,
        COALESCE(SUM(monto), 0) as total,
        COUNT(*) as cantidad
      FROM pagos
      WHERE EXTRACT(MONTH FROM creado_en) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM creado_en) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND estado = 'pagado'
      GROUP BY tipo_pago
    `;

    // Gastos operativos (salarios del personal)
    const gastos = await sql`
      SELECT 
        COALESCE(SUM(salario), 0) as total_salarios,
        COUNT(*) as personal_activo
      FROM personal_edificio
      WHERE activo = true
    `;

    // Historial de pagos recientes (últimos 30 días)
    const historial = await sql`
      SELECT 
        DATE(creado_en) as fecha,
        COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as ingresos
      FROM pagos
      WHERE creado_en >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(creado_en)
      ORDER BY fecha DESC
      LIMIT 30
    `;

    // Comparación con mes anterior
    const mesAnterior = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as ingresos_mes_anterior
      FROM pagos
      WHERE EXTRACT(MONTH FROM creado_en) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
        AND EXTRACT(YEAR FROM creado_en) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
    `;

    const ingresosActuales = Number(ingresosMes[0].ingresos_confirmados);
    const ingresosPrevios = Number(mesAnterior[0].ingresos_mes_anterior);
    const diferencia = ingresosActuales - ingresosPrevios;
    const porcentajeCambio = ingresosPrevios > 0 
      ? Math.round((diferencia / ingresosPrevios) * 100)
      : 100;

    const stats = {
      ingresos: {
        total_mes: ingresosActuales,
        pendientes: Number(ingresosMes[0].ingresos_pendientes),
        confirmados: ingresosActuales,
        total_pagos: Number(ingresosMes[0].total_pagos),
        pagos_completados: Number(ingresosMes[0].pagos_completados),
        pagos_pendientes: Number(ingresosMes[0].pagos_pendientes),
        pagos_atrasados: Number(ingresosMes[0].pagos_atrasados),
        tendencia: diferencia >= 0 ? 'up' : 'down',
        porcentaje_cambio: Math.abs(porcentajeCambio)
      },
      gastos: {
        salarios_personal: Number(gastos[0].total_salarios),
        personal_activo: Number(gastos[0].personal_activo)
      },
      balance: {
        neto: ingresosActuales - Number(gastos[0].total_salarios),
        ingresos: ingresosActuales,
        gastos: Number(gastos[0].total_salarios)
      },
      por_tipo: porTipo.map(t => ({
        tipo: t.tipo_pago,
        total: Number(t.total),
        cantidad: Number(t.cantidad)
      })),
      historial: historial.map(h => ({
        fecha: h.fecha,
        ingresos: Number(h.ingresos)
      }))
    };

    console.log("✅ Estadísticas financieras obtenidas:", stats);

    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener estadísticas financieras:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener estadísticas financieras",
        details: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}
