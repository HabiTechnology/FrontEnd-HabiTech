import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log("🏢 Obteniendo estadísticas del edificio...");

    // Verificar conexión a BD
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL no está configurada");
    }

    // Total de departamentos y ocupación (con manejo de error)
    let departamentos;
    try {
      departamentos = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'ocupado') as ocupados,
          COUNT(*) FILTER (WHERE estado = 'disponible') as disponibles,
          COUNT(*) FILTER (WHERE estado = 'mantenimiento') as en_mantenimiento
        FROM departamentos
        WHERE activo = true
      `;
    } catch (e) {
      console.warn("⚠️ Tabla 'departamentos' no existe, usando valores por defecto");
      departamentos = [{ total: 0, ocupados: 0, disponibles: 0, en_mantenimiento: 0 }];
    }

    // Total de residentes activos
    let residentes;
    try {
      residentes = await sql`
        SELECT 
          COUNT(*) as total_residentes,
          COUNT(*) FILTER (WHERE tipo_relacion = 'propietario') as propietarios,
          COUNT(*) FILTER (WHERE tipo_relacion = 'inquilino') as inquilinos
        FROM residentes
        WHERE activo = true
      `;
    } catch (e) {
      console.warn("⚠️ Tabla 'residentes' no existe, usando valores por defecto");
      residentes = [{ total_residentes: 0, propietarios: 0, inquilinos: 0 }];
    }

    // Personal del edificio
    let personal;
    try {
      personal = await sql`
        SELECT 
          COUNT(*) as total_personal,
          COUNT(*) FILTER (WHERE cargo = 'seguridad') as seguridad,
          COUNT(*) FILTER (WHERE cargo = 'limpieza') as limpieza,
          COUNT(*) FILTER (WHERE cargo = 'mantenimiento') as mantenimiento,
          COUNT(*) FILTER (WHERE cargo = 'administracion') as administracion
        FROM personal_edificio
        WHERE activo = true
      `;
    } catch (e) {
      console.warn("⚠️ Tabla 'personal_edificio' no existe, usando valores por defecto");
      personal = [{ total_personal: 0, seguridad: 0, limpieza: 0, mantenimiento: 0, administracion: 0 }];
    }

    // Solicitudes de mantenimiento pendientes
    let mantenimiento;
    try {
      mantenimiento = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
          COUNT(*) FILTER (WHERE estado = 'en_proceso') as en_proceso
        FROM solicitudes_mantenimiento
      `;
    } catch (e) {
      console.warn("⚠️ Tabla 'solicitudes_mantenimiento' no existe, usando valores por defecto");
      mantenimiento = [{ total: 0, pendientes: 0, en_proceso: 0 }];
    }

    // Áreas comunes
    let areas;
    try {
      areas = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'disponible') as disponibles,
          COUNT(*) FILTER (WHERE estado = 'ocupado') as ocupadas
        FROM areas_comunes
      `;
    } catch (e) {
      console.warn("⚠️ Tabla 'areas_comunes' no existe, usando valores por defecto");
      areas = [{ total: 0, disponibles: 0, ocupadas: 0 }];
    }

    // Actividad reciente de acceso
    let accesos;
    try {
      accesos = await sql`
        SELECT COUNT(*) as total_hoy
        FROM registros_acceso
        WHERE DATE(fecha_hora) = CURRENT_DATE
      `;
    } catch (e) {
      console.warn("⚠️ Tabla 'registros_acceso' no existe, usando valores por defecto");
      accesos = [{ total_hoy: 0 }];
    }

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
