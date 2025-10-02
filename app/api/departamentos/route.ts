import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { 
  validateApiInput, 
  sanitizeQueryParams, 
  validatePaginationParams,
  departamentoValidationSchema,
  SECURITY_CONSTANTS
} from '@/lib/security-validation';

export async function GET(request: Request) {
  try {
    console.log('🔍 Conectando a base de datos para obtener departamentos...');
    
    // Obtener y sanitizar parámetros de consulta
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const sanitizedParams = sanitizeQueryParams(rawParams);
    
    const soloDisponibles = sanitizedParams.disponibles === 'true';
    const page = parseInt(sanitizedParams.page || '1', 10);
    const limit = parseInt(sanitizedParams.limit || '10', 10);
    
    // Validar parámetros de paginación
    const { page: validPage, limit: validLimit } = validatePaginationParams(page, limit);
    

    
    // Validar headers de autorización básica
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.headers.get('cookie')?.includes('privy-session');
    
    if (!authHeader && !sessionCookie && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }
    

    
    // Query para obtener departamentos (solo activos)
    const departamentos = await sql`
      SELECT 
        id,
        numero,
        piso,
        dormitorios,
        banos,
        area_m2,
        renta_mensual,
        mantenimiento_mensual,
        estado,
        descripcion,
        servicios,
        imagenes,
        activo,
        creado_en
      FROM departamentos
      WHERE activo = true ${soloDisponibles ? sql`AND estado = 'disponible'` : sql``}
      ORDER BY piso ASC, numero ASC
    `;



    // Devolver los datos directos de la tabla departamentos
    const departamentosFormateados = departamentos.map((departamento: any) => ({
      id: departamento.id,
      numero: departamento.numero,
      piso: departamento.piso,
      dormitorios: departamento.dormitorios,
      banos: departamento.banos,
      area_m2: departamento.area_m2,
      renta_mensual: Number(departamento.renta_mensual) || 0,
      mantenimiento_mensual: Number(departamento.mantenimiento_mensual) || 0,
      estado: departamento.estado,
      descripcion: departamento.descripcion,
      servicios: departamento.servicios,
      
      activo: departamento.activo,
      creado_en: departamento.creado_en
    }));


    return NextResponse.json(departamentosFormateados);

  } catch (error) {
    console.error('❌ Error obteniendo departamentos:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('🔍 Creando nuevo departamento...');
    
    // Validar autorización
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.headers.get('cookie')?.includes('privy-session');
    
    if (!authHeader && !sessionCookie) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }
    
    // Validar tamaño del contenido
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > SECURITY_CONSTANTS.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Contenido demasiado grande' },
        { status: 413 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'JSON inválido en el cuerpo de la petición' },
        { status: 400 }
      );
    }
    
    console.log('📝 Datos recibidos para validación:', JSON.stringify(body, null, 2));
    
    // Validar datos con schema de seguridad
    const validation = validateApiInput(body, departamentoValidationSchema);
    
    if (!validation.success) {
      console.error('❌ Error de validación:', validation.error);
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validation.error,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    console.log('✅ Validación exitosa, datos validados:', JSON.stringify(validation.data, null, 2));
    const validatedData = validation.data;
    
    // Extraer datos validados
    const {
      numero,
      piso,
      dormitorios,
      banos,
      area_m2,
      renta_mensual,
      mantenimiento_mensual,
      estado,
      descripcion,
      servicios,
      imagenes
    } = validatedData;

    // Preparar datos para inserción con validación adicional
    const serviciosJson = servicios && typeof servicios === 'object' ? JSON.stringify(servicios) : null;
    const imagenesJson = imagenes && Array.isArray(imagenes) ? JSON.stringify(imagenes) : null;

    console.log('📊 Datos validados preparados para inserción');
    console.log('🗃️ Inserción SQL con parámetros:', {
      numero,
      piso,
      dormitorios,
      banos,
      area_m2,
      renta_mensual,
      mantenimiento_mensual,
      estado,
      descripcion,
      serviciosJson,
      imagenesJson
    });

    // Crear departamento
    let nuevoDepartamento;
    try {
      nuevoDepartamento = await sql`
        INSERT INTO departamentos (
          numero, 
          piso, 
          dormitorios, 
          banos, 
          area_m2, 
          renta_mensual, 
          mantenimiento_mensual, 
          estado, 
          descripcion,
          servicios,
          imagenes,
          activo
        )
        VALUES (
          ${numero}, 
          ${piso}, 
          ${dormitorios}, 
          ${banos}, 
          ${area_m2 || null}, 
          ${renta_mensual}, 
          ${mantenimiento_mensual}, 
          ${estado || 'disponible'}, 
          ${descripcion || null},
          ${serviciosJson},
          ${imagenesJson},
          true
        )
        RETURNING *
      `;
    } catch (sqlError) {
      console.error('❌ Error en consulta SQL:', sqlError);
      throw sqlError;
    }

    console.log('✅ Departamento creado exitosamente:', nuevoDepartamento[0]);
    return NextResponse.json(nuevoDepartamento[0], { status: 201 });

  } catch (error) {
    console.error('❌ Error creando departamento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}