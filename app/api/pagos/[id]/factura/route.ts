// ========================================
// 🧾 API: OBTENER DATOS COMPLETOS PARA FACTURA
// ========================================

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    console.log("🧾 Obteniendo factura para pago ID:", params.id)
    const pagoId = parseInt(params.id);

    if (isNaN(pagoId)) {
      console.error("❌ ID inválido:", params.id)
      return NextResponse.json(
        { error: "❌ ID de pago inválido" },
        { status: 400 }
      );
    }

    // Obtener datos completos del pago con relaciones
    console.log("🔍 Ejecutando query para pago ID:", pagoId)
    
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
        p.recargo::numeric as recargo,
        
        -- Datos del residente (a través de usuario)
        r.id as residente_tabla_id,
        r.usuario_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo,
        u.numero_documento as usuario_documento,
        u.telefono as usuario_telefono,
        
        -- Datos del departamento
        d.numero as departamento_numero,
        d.piso as departamento_piso
        
      FROM pagos p
      LEFT JOIN residentes r ON p.residente_id = r.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN departamentos d ON p.departamento_id = d.id
      WHERE p.id = ${pagoId}
    `;

    console.log("📊 Resultado de query:", result.length, "registros")
    if (result.length > 0) {
      console.log("📋 Primer registro (raw):", JSON.stringify(result[0], null, 2))
    }

    if (result.length === 0) {
      console.error("❌ No se encontró el pago:", pagoId)
      return NextResponse.json(
        { 
          success: false,
          error: "❌ Pago no encontrado" 
        },
        { status: 404 }
      );
    }

    const row = result[0];
    console.log("✅ Pago encontrado:", row.id, "- Tipo:", row.tipo_pago)
    console.log("👤 Residente ID:", row.residente_id, "- Usuario ID:", row.usuario_id)
    console.log("🏢 Departamento ID:", row.departamento_id, "- Número:", row.departamento_numero)
    
    // Verificar si tenemos datos del residente y departamento
    const tieneResidente = row.usuario_nombre && row.usuario_apellido;
    const tieneDepartamento = row.departamento_numero;
    
    console.log("✓ Tiene datos de residente:", tieneResidente)
    console.log("✓ Tiene datos de departamento:", tieneDepartamento)
    
    // Transformar los datos al formato esperado por el generador de PDF
    const pago = {
      id: row.id,
      residente_id: row.residente_id,
      departamento_id: row.departamento_id,
      monto: Number(row.monto),
      tipo_pago: row.tipo_pago || 'renta',
      estado: row.estado || 'pendiente',
      fecha_vencimiento: row.fecha_vencimiento,
      fecha_pago: row.fecha_pago || null,
      metodo_pago: row.metodo_pago || null,
      referencia: row.referencia || null,
      notas: row.descripcion || null,
      residente: {
        usuario: {
          nombre: row.usuario_nombre || 'Residente',
          apellido: row.usuario_apellido || `#${row.residente_id}`,
          correo: row.usuario_correo || 'sin-email@habitech.com',
          numero_documento: row.usuario_documento || 'N/A',
          telefono: row.usuario_telefono || 'N/A'
        }
      },
      departamento: {
        numero: row.departamento_numero || `Depto ${row.departamento_id}`,
        piso: row.departamento_piso || 0
      }
    };

    console.log("✅ Datos transformados para factura:")
    console.log("   - ID:", pago.id, "| Monto:", pago.monto)
    console.log("   - Residente:", pago.residente.usuario.nombre, pago.residente.usuario.apellido)
    console.log("   - Departamento:", pago.departamento.numero, "Piso:", pago.departamento.piso)

    return NextResponse.json({
      success: true,
      pago,
    });
  } catch (error) {
    console.error("❌ Error al obtener datos del pago para factura:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
