import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {

    
    // Obtener par�metros de consulta
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get('activos') === 'true';
    

    
    // Query con JOINs para obtener datos completos de usuarios y departamentos
    const residentes = await sql`
      SELECT 
        r.id,
        r.usuario_id,
        r.departamento_id,
        r.tipo_relacion,
        r.fecha_ingreso,
        r.fecha_salida,
        r.nombre_contacto_emergencia,
        r.telefono_contacto_emergencia,
        r.es_principal,
        r.activo,
        r.creado_en,
        -- Datos del usuario (verificando nombres de columnas)
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.correo as usuario_correo,
        u.telefono as usuario_telefono,
        u.numero_documento as usuario_documento,
        u.imagen_perfil as usuario_imagen,
        -- Datos del departamento (verificando nombres de columnas)
        d.numero as departamento_numero,
        d.piso as departamento_piso,
        d.dormitorios as departamento_dormitorios,
        d.banos as departamento_banos,
        d.area_m2 as departamento_area,
        d.renta_mensual as departamento_renta,
        d.estado as departamento_estado
      FROM residentes r
      LEFT JOIN usuarios u ON r.usuario_id = u.id AND u.activo = true
      LEFT JOIN departamentos d ON r.departamento_id = d.id AND d.activo = true
      ${soloActivos ? sql`WHERE r.activo = true` : sql``}
      ORDER BY r.fecha_ingreso DESC, r.id ASC
    `;
;

    // Verificar qu� campos vienen del JOIN
    if (residentes.length > 0) {
      const primerResidente = residentes[0];
;

    }

    // Devolver los datos con informaci�n completa de usuarios y departamentos
    const residentesFormateados = residentes.map((residente: any) => ({
      id: residente.id,
      usuario_id: residente.usuario_id,
      departamento_id: residente.departamento_id,
      tipo_relacion: residente.tipo_relacion,
      fecha_ingreso: residente.fecha_ingreso,
      fecha_salida: residente.fecha_salida,
      nombre_contacto_emergencia: residente.nombre_contacto_emergencia,
      telefono_contacto_emergencia: residente.telefono_contacto_emergencia,
      es_principal: residente.es_principal,
      activo: residente.activo,
      creado_en: residente.creado_en,
      // Informaci�n del usuario (solo si existe)
      usuario: residente.usuario_nombre ? {
        nombre: residente.usuario_nombre,
        apellido: residente.usuario_apellido,
        correo: residente.usuario_correo,
        telefono: residente.usuario_telefono,
        numero_documento: residente.usuario_documento,
        imagen_perfil: residente.usuario_imagen
      } : null,
      // Informaci�n del departamento (solo si existe)
      departamento: residente.departamento_numero ? {
        numero: residente.departamento_numero,
        piso: residente.departamento_piso,
        dormitorios: residente.departamento_dormitorios,
        banos: residente.departamento_banos,
        area_m2: residente.departamento_area,
        renta_mensual: residente.departamento_renta,
        estado: residente.departamento_estado
      } : null
    }));

    return NextResponse.json(residentesFormateados);

  } catch (error) {

    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
