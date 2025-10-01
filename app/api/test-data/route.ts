import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {

    
    // Obtener todos los residentes
    const residentes = await sql`SELECT id, usuario_id, departamento_id FROM residentes`;

    
    // Obtener todos los usuarios 
    const usuarios = await sql`SELECT id, nombre, apellido, correo FROM usuarios`;

    
    // Obtener todos los departamentos
    const departamentos = await sql`SELECT id, numero, piso FROM departamentos`;

    
    // Verificar quÃ© relaciones faltan
    const relacionesProblema = [];
    
    for (const residente of residentes) {
      const usuarioExiste = usuarios.find(u => u.id === residente.usuario_id);
      const departamentoExiste = departamentos.find(d => d.id === residente.departamento_id);
      
      if (!usuarioExiste) {
        relacionesProblema.push(`Residente ${residente.id} busca usuario ${residente.usuario_id} que NO EXISTE`);
      }
      if (!departamentoExiste) {
        relacionesProblema.push(`Residente ${residente.id} busca departamento ${residente.departamento_id} que NO EXISTE`);
      }
    }
    

    
    return NextResponse.json({
      residentes,
      usuarios,
      departamentos,
      relacionesProblema,
      mensaje: 'AnÃ¡lisis de relaciones completado'
    });

  } catch (error) {

    return NextResponse.json(
      { 
        error: 'Error verificando datos', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
