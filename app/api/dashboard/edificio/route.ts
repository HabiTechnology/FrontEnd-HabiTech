import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log("🏢 Obteniendo estadísticas del edificio...");

    // Total de departamentos y ocupación
    const departamentos = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'ocupado') as ocupados,
        COUNT(*) FILTER (WHERE estado = 'disponible') as disponibles,
        COUNT(*) FILTER (WHERE estado = 'mantenimiento') as en_mantenimiento
      FROM departamentos
      WHERE activo = true
    `;

    // Total de residentes activos
    const residentes = await sql`
      SELECT 
        COUNT(*) as total_residentes,
        COUNT(*) FILTER (WHERE tipo_relacion = 'propietario') as propietarios,
        COUNT(*) FILTER (WHERE tipo_relacion = 'inquilino') as inquilinos
      FROM residentes
      WHERE activo = true
    `;

    // Personal del edificio
    const personal = await sql`
      SELECT 
        COUNT(*) as total_personal,
        COUNT(*) FILTER (WHERE cargo = 'seguridad') as seguridad,
        COUNT(*) FILTER (WHERE cargo = 'limpieza') as limpieza,
        COUNT(*) FILTER (WHERE cargo = 'mantenimiento') as mantenimiento,
        COUNT(*) FILTER (WHERE cargo = 'administracion') as administracion
      FROM personal_edificio
      WHERE activo = true
    `;

    // Solicitudes de mantenimiento pendientes
    const mantenimiento = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_proceso') as en_proceso
      FROM solicitudes_mantenimiento
    `;

    // Áreas comunes
    const areas = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'disponible') as disponibles,
        COUNT(*) FILTER (WHERE estado = 'ocupado') as ocupadas
      FROM areas_comunes
    `;

    // Actividad reciente de acceso
    const accesos = await sql`
      SELECT COUNT(*) as total_hoy
      FROM registros_acceso
      WHERE DATE(fecha_hora) = CURRENT_DATE
    `;

    const stats = {
      departamentos: {
        total: Number(departamentos[0].total),
        ocupados: Number(departamentos[0].ocupados),
        disponibles: Number(departamentos[0].disponibles),
        en_mantenimiento: Number(departamentos[0].en_mantenimiento),
        porcentaje_ocupacion: departamentos[0].total > 0 
          ? Math.round((Number(departamentos[0].ocupados) / Number(departamentos[0].total)) * 100)
          : 0
      },
      residentes: {
        total: Number(residentes[0].total_residentes),
        propietarios: Number(residentes[0].propietarios),
        inquilinos: Number(residentes[0].inquilinos)
      },
      personal: {
        total: Number(personal[0].total_personal),
        seguridad: Number(personal[0].seguridad),
        limpieza: Number(personal[0].limpieza),
        mantenimiento: Number(personal[0].mantenimiento),
        administracion: Number(personal[0].administracion)
      },
      mantenimiento: {
        total: Number(mantenimiento[0].total),
        pendientes: Number(mantenimiento[0].pendientes),
        en_proceso: Number(mantenimiento[0].en_proceso)
      },
      areas_comunes: {
        total: Number(areas[0].total),
        disponibles: Number(areas[0].disponibles),
        ocupadas: Number(areas[0].ocupadas)
      },
      accesos_hoy: Number(accesos[0].total_hoy)
    };

    console.log("✅ Estadísticas del edificio obtenidas:", stats);

    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener estadísticas del edificio:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener estadísticas",
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
