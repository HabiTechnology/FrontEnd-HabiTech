// Configuración UTF-8 para todas las API routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function apiMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const response = await handler(req);
    
    // Asegurar UTF-8 en todas las respuestas
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    
    return response;
  };
}

// Helper para crear respuestas JSON con UTF-8
export function jsonResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
