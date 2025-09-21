import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Iniciando GET residentes stats...');
    console.log('🔗 DATABASE_URL existe:', !!process.env.DATABASE_URL);

    // Consultas para obtener estadísticas
    const [
      totalResidentes,
      residentesActivos,
      departamentosOcupados,
      solicitudesPendientes
    ] = await Promise.all([
      // Total de residentes
      sql`SELECT COUNT(*) as total FROM residentes`,
      
      // Residentes activos
      sql`SELECT COUNT(*) as total FROM residentes WHERE activo = true`,
      
      // Departamentos ocupados (con residentes activos)
      sql`
        SELECT COUNT(DISTINCT departamento_id) as total 
        FROM residentes 
        WHERE activo = true
      `,
      
      // Solicitudes pendientes (asumiendo que hay una tabla de solicitudes)
      sql`
        SELECT COUNT(*) as total 
        FROM solicitudes_mantenimiento 
        WHERE estado = 'pendiente'
      `.catch(() => [{ total: 0 }]) // Fallback si no existe la tabla
    ]);

    const stats = {
      totalResidentes: parseInt(totalResidentes[0]?.total || 0),
      residentesActivos: parseInt(residentesActivos[0]?.total || 0),
      departamentosOcupados: parseInt(departamentosOcupados[0]?.total || 0),
      solicitudesPendientes: parseInt(solicitudesPendientes[0]?.total || 0)
    };

    console.log('📊 Estadísticas calculadas:', stats);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas de residentes:', error);
    
    // Devolver datos por defecto en caso de error
    return NextResponse.json({
      totalResidentes: 0,
      residentesActivos: 0,
      departamentosOcupados: 0,
      solicitudesPendientes: 0
    });
  }
}