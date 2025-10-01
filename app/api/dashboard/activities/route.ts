import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Obtener actividades recientes del edificio
    const actividades = await sql`
      SELECT * FROM (
        -- Pagos recientes
        SELECT 
          p.id,
          'pago' as tipo,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          CONCAT('Pago de ', p.tipo_pago, ' - ', p.descripcion) as descripcion,
          p.monto,
          p.creado_en as fecha,
          CASE WHEN p.estado = 'pagado' THEN 'completado' ELSE 'pendiente' END as estado
        FROM pagos p
        INNER JOIN residentes r ON p.residente_id = r.id
        INNER JOIN usuarios u ON r.usuario_id = u.id
        WHERE p.creado_en >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        
        UNION ALL
        
        -- Solicitudes de mantenimiento
        SELECT 
          sm.id,
          'mantenimiento' as tipo,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          sm.descripcion,
          NULL as monto,
          sm.fecha_creacion as fecha,
          sm.estado::text as estado
        FROM solicitudes_mantenimiento sm
        INNER JOIN usuarios u ON sm.creado_por = u.id
        WHERE sm.fecha_creacion >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        
        UNION ALL
        
        -- Reservas de áreas comunes
        SELECT 
          ra.id,
          'reserva' as tipo,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          CONCAT('Reserva de ', ac.nombre) as descripcion,
          NULL as monto,
          ra.creado_en as fecha,
          ra.estado::text as estado
        FROM reservas_areas ra
        INNER JOIN areas_comunes ac ON ra.area_id = ac.id
        INNER JOIN residentes r ON ra.residente_id = r.id
        INNER JOIN usuarios u ON r.usuario_id = u.id
        WHERE ra.creado_en >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        
        UNION ALL
        
        -- Anuncios publicados
        SELECT 
          a.id,
          'anuncio' as tipo,
          CONCAT(u.nombre, ' ', u.apellido) as usuario,
          a.titulo as descripcion,
          NULL as monto,
          a.fecha_publicacion as fecha,
          CASE WHEN a.activo THEN 'activo' ELSE 'inactivo' END as estado
        FROM anuncios a
        INNER JOIN usuarios u ON a.creado_por = u.id
        WHERE a.fecha_publicacion >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ) actividades
      ORDER BY fecha DESC
      LIMIT 20
    `

    return NextResponse.json({
      actividades: actividades.map(act => ({
        id: act.id,
        tipo: act.tipo,
        usuario: act.usuario,
        descripcion: act.descripcion,
        monto: act.monto ? Number(act.monto) : null,
        fecha: act.fecha,
        estado: act.estado
      }))
    })
  } catch (error) {
    console.error("Error fetching activities data:", error)
    return NextResponse.json(
      { error: "Error al obtener actividades recientes" },
      { status: 500 }
    )
  }
}
