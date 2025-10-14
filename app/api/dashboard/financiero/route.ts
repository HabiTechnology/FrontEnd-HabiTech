import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log("💰 Obteniendo estadísticas financieras...");

    // Verificar conexión a BD
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL no está configurada");
    }

    // Ingresos esperados del mes basados en departamentos ocupados
    let ingresosEsperados;
    try {
      ingresosEsperados = await sql`
        SELECT 
          COALESCE(SUM(renta_mensual + mantenimiento_mensual), 0) as total_mensual_esperado,
          COUNT(*) as total_ocupados
        FROM departamentos
        WHERE estado = 'ocupado' AND activo = true
      `;
    } catch (e) {
      console.warn("⚠️ Error en tabla departamentos, usando valores por defecto");
      ingresosEsperados = [{ total_mensual_esperado: 0, total_ocupados: 0 }];
    }

    // Ingresos del mes actual (pagos reales)
    let ingresosMes;
    try {
      ingresosMes = await sql`
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
    } catch (e) {
      console.warn("⚠️ Error en tabla pagos, usando valores por defecto");
      ingresosMes = [{
        total_ingresos: 0,
        total_pagos: 0,
        pagos_completados: 0,
        pagos_pendientes: 0,
        pagos_atrasados: 0,
        ingresos_confirmados: 0,
        ingresos_pendientes: 0
      }];
    }

    // Desglose por tipo de pago
    let porTipo: any[] = [];
    try {
      porTipo = await sql`
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
    } catch (e) {
      console.warn("⚠️ Error obteniendo desglose por tipo");
      porTipo = [];
    }

    // Gastos operativos (salarios del personal)
    let gastos;
    try {
      gastos = await sql`
        SELECT 
          COALESCE(SUM(salario), 0) as total_salarios,
          COUNT(*) as personal_activo
        FROM personal_edificio
        WHERE activo = true
      `;
    } catch (e) {
      console.warn("⚠️ Error en tabla personal_edificio");
      gastos = [{ total_salarios: 0, personal_activo: 0 }];
    }

    // Historial de pagos recientes (últimos 30 días)
    let historial: any[] = [];
    try {
      historial = await sql`
        SELECT 
          DATE(creado_en) as fecha,
          COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as ingresos
        FROM pagos
        WHERE creado_en >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(creado_en)
        ORDER BY fecha DESC
        LIMIT 30
      `;
    } catch (e) {
      console.warn("⚠️ Error obteniendo historial");
      historial = [];
    }

    // Comparación con mes anterior
    let mesAnterior;
    try {
      mesAnterior = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as ingresos_mes_anterior
        FROM pagos
        WHERE EXTRACT(MONTH FROM creado_en) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
          AND EXTRACT(YEAR FROM creado_en) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
      `;
    } catch (e) {
      console.warn("⚠️ Error comparando con mes anterior");
      mesAnterior = [{ ingresos_mes_anterior: 0 }];
    }

    // Usar ingresos esperados de departamentos ocupados como base
    const ingresosMensualesEsperados = Number(ingresosEsperados[0].total_mensual_esperado);
    const ingresosConfirmados = Number(ingresosMes[0].ingresos_confirmados);
    const ingresosPrevios = Number(mesAnterior[0].ingresos_mes_anterior);
    const diferencia = ingresosMensualesEsperados - ingresosPrevios;
    const porcentajeCambio = ingresosPrevios > 0 
      ? Math.round((diferencia / ingresosPrevios) * 100)
      : 100;

    const stats = {
      ingresos: {
        total_mes: ingresosMensualesEsperados, // Usar ingresos esperados de departamentos ocupados
        pendientes: Number(ingresosMes[0].ingresos_pendientes),
        confirmados: ingresosConfirmados,
        total_pagos: Number(ingresosMes[0].total_pagos),
        pagos_completados: Number(ingresosMes[0].pagos_completados),
        pagos_pendientes: Number(ingresosMes[0].pagos_pendientes),
        pagos_atrasados: Number(ingresosMes[0].pagos_atrasados),
        tendencia: diferencia >= 0 ? 'up' : 'down',
        porcentaje_cambio: Math.abs(porcentajeCambio),
        departamentos_ocupados: Number(ingresosEsperados[0].total_ocupados)
      },
      gastos: {
        salarios_personal: Number(gastos[0].total_salarios),
        personal_activo: Number(gastos[0].personal_activo)
      },
      balance: {
        neto: ingresosMensualesEsperados - Number(gastos[0].total_salarios),
        ingresos: ingresosMensualesEsperados,
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
