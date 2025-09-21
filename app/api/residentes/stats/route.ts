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
      residentesInactivos,
      propietarios,
      inquilinos,
      familiares
    ] = await Promise.all([
      // Total de residentes
      sql`SELECT COUNT(*) as total FROM residentes`,
      
      // Residentes activos
      sql`SELECT COUNT(*) as total FROM residentes WHERE activo = true`,
      
      // Residentes inactivos
      sql`SELECT COUNT(*) as total FROM residentes WHERE activo = false`,
      
      // Propietarios
      sql`SELECT COUNT(*) as total FROM residentes WHERE tipo_relacion = 'propietario'`,
      
      // Inquilinos
      sql`SELECT COUNT(*) as total FROM residentes WHERE tipo_relacion = 'inquilino'`,
      
      // Familiares
      sql`SELECT COUNT(*) as total FROM residentes WHERE tipo_relacion = 'familiar'`
    ]);

    const stats = {
      totalResidentes: parseInt(totalResidentes[0]?.total || 0),
      residentesActivos: parseInt(residentesActivos[0]?.total || 0),
      residentesInactivos: parseInt(residentesInactivos[0]?.total || 0),
      propietarios: parseInt(propietarios[0]?.total || 0),
      inquilinos: parseInt(inquilinos[0]?.total || 0),
      familiares: parseInt(familiares[0]?.total || 0)
    };

    console.log('📊 Estadísticas calculadas:', stats);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas de residentes:', error);
    
    // Devolver datos por defecto en caso de error
    return NextResponse.json({
      totalResidentes: 0,
      residentesActivos: 0,
      residentesInactivos: 0,
      propietarios: 0,
      inquilinos: 0,
      familiares: 0
    });
  }
}