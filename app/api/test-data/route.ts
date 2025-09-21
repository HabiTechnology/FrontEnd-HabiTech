import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    console.log('🧪 Verificando relaciones entre tablas...');
    
    // Obtener todos los residentes
    const residentes = await sql`SELECT id, usuario_id, departamento_id FROM residentes`;
    console.log('👥 Todos los residentes:', residentes);
    
    // Obtener todos los usuarios 
    const usuarios = await sql`SELECT id, nombre, apellido, correo FROM usuarios`;
    console.log('🧑 Todos los usuarios:', usuarios);
    
    // Obtener todos los departamentos
    const departamentos = await sql`SELECT id, numero, piso FROM departamentos`;
    console.log('🏠 Todos los departamentos:', departamentos);
    
    // Verificar qué relaciones faltan
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
    
    console.log('❌ Problemas encontrados:', relacionesProblema);
    
    return NextResponse.json({
      residentes,
      usuarios,
      departamentos,
      relacionesProblema,
      mensaje: 'Análisis de relaciones completado'
    });

  } catch (error) {
    console.error('❌ Error verificando datos:', error);
    return NextResponse.json(
      { 
        error: 'Error verificando datos', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}