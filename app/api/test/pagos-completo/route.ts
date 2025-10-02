// ========================================
// 🧪 ENDPOINT DE PRUEBA: Verificar estructura de pagos completos
// ========================================

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    console.log("🧪 TEST: Obteniendo primer pago con datos completos")
    
    // Obtener el primer pago para pruebas
    const result = await sql`
      SELECT 
        p.id,
        p.residente_id,
        p.departamento_id,
        p.monto::numeric as monto,
        p.tipo_pago::text as tipo_pago,
        p.estado::text as estado,
        p.descripcion,
        p.fecha_vencimiento::text as fecha_vencimiento,
        p.fecha_pago::text as fecha_pago,
        p.metodo_pago::text as metodo_pago,
        p.id_transaccion as referencia,
        
        -- Datos del residente
        r.id as residente_tabla_id,
        r.usuario_id,
        r.tipo_relacion::text as residente_tipo_relacion,
        r.es_principal,
        
        -- Datos del usuario
        u.id as usuario_id_tabla,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo,
        u.telefono as usuario_telefono,
        u.numero_documento as usuario_documento,
        
        -- Datos del departamento
        d.numero as departamento_numero,
        d.piso as departamento_piso,
        d.renta_mensual::numeric as departamento_renta
        
      FROM pagos p
      LEFT JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON p.departamento_id = d.id
      ORDER BY p.id DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        message: "❌ No hay pagos en la base de datos",
        data: null
      });
    }

    const row = result[0];
    
    return NextResponse.json({
      success: true,
      message: "✅ Datos obtenidos correctamente",
      checks: {
        tiene_pago: !!row.id,
        tiene_residente: !!row.residente_tabla_id,
        tiene_usuario: !!row.usuario_id_tabla,
        tiene_departamento: !!row.departamento_numero,
        usuario_nombre: row.usuario_nombre || "❌ NULL",
        departamento_numero: row.departamento_numero || "❌ NULL"
      },
      data: {
        pago: {
          id: row.id,
          residente_id: row.residente_id,
          departamento_id: row.departamento_id,
          monto: Number(row.monto),
          tipo_pago: row.tipo_pago,
          estado: row.estado
        },
        residente: {
          id: row.residente_tabla_id,
          usuario_id: row.usuario_id,
          tipo_relacion: row.residente_tipo_relacion,
          es_principal: row.es_principal
        },
        usuario: {
          id: row.usuario_id_tabla,
          nombre: row.usuario_nombre,
          apellido: row.usuario_apellido,
          correo: row.usuario_correo,
          telefono: row.usuario_telefono,
          documento: row.usuario_documento
        },
        departamento: {
          numero: row.departamento_numero,
          piso: row.departamento_piso,
          renta_mensual: Number(row.departamento_renta)
        }
      },
      raw_row: row
    });

  } catch (error) {
    console.error("❌ Error en test:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error al ejecutar prueba",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
