import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/', // Dashboard principal
  '/dashboard',
  '/financiero',
  '/admin',
  '/departamentos',
  '/residentes',
  '/accesos',
  '/solicitudes',
  '/solicitud-renta',
  '/tienda',
  '/notificaciones'
]

// Rutas de API que requieren autenticación
const protectedApiRoutes = [
  '/api/departamentos',
  '/api/residentes',
  '/api/accesos',
  '/api/solicitudes-renta',
  '/api/usuarios'
]

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/login',
  '/api/test-data'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Aplicar headers de seguridad a todas las respuestas
  const response = NextResponse.next()
  
  // Headers de seguridad básicos (complementarios al next.config.ts)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  
  // Validación de origen para prevenir CSRF en APIs
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // En producción, validar que el origen coincida con el host
    if (process.env.NODE_ENV === 'production' && origin && host) {
      const allowedOrigins = [
        `https://${host}`,
        'https://habitech.app',
        'https://www.habitech.app'
      ]
      
      if (!allowedOrigins.includes(origin)) {
        return new NextResponse('Forbidden: Invalid Origin', { status: 403 })
      }
    }
    
    // Validar métodos HTTP permitidos por ruta
    const method = request.method
    
    if (pathname.includes('/api/')) {
      // Solo permitir métodos específicos para APIs
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      if (!allowedMethods.includes(method)) {
        return new NextResponse('Method Not Allowed', { status: 405 })
      }
    }
  }
  
  // Validaciones de tamaño de payload para prevenir ataques DoS
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    const maxSize = 10 * 1024 * 1024 // 10MB máximo
    
    if (size > maxSize) {
      return new NextResponse('Payload Too Large', { status: 413 })
    }
  }
  
  // Validación básica de User-Agent para bloquear bots maliciosos
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'curl/7.1']
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()))) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // Protección contra inyección en parámetros URL
  const searchParams = request.nextUrl.searchParams
  for (const [key, value] of searchParams.entries()) {
    // Detectar patrones de inyección SQL básicos
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\'|\"|;|--|\*|\|)/,
      /(\bOR\b|\bAND\b).*(\=|\<|\>)/i
    ]
    
    if (sqlPatterns.some(pattern => pattern.test(value))) {
      return new NextResponse('Bad Request: Invalid Parameter', { status: 400 })
    }
    
    // Limitar longitud de parámetros
    if (value.length > 1000) {
      return new NextResponse('Bad Request: Parameter Too Long', { status: 400 })
    }
  }
  
  // Verificar si hay tokens de sesión básicos
  const hasSession = request.cookies.get('privy-session') || 
                    request.cookies.get('privy-token') ||
                    request.headers.get('authorization')

  // Verificación básica de sesión para rutas protegidas
  const isProtectedRoute = protectedRoutes.some(route => {
    // Para la ruta raíz, solo coincidir exactamente
    if (route === '/' && pathname === '/') return true
    // Para otras rutas, usar startsWith pero no coincidir con raíz
    if (route !== '/' && pathname.startsWith(route)) return true
    return false
  })
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Redirigir a login si no está autenticado (solo para rutas de página, no API)
  if (isProtectedRoute && !isPublicRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/' && pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }
  
  // Para rutas API protegidas, verificar autenticación
  if (isProtectedApi && request.method !== 'OPTIONS') {
    const hasAuth = request.cookies.get('privy-session') || 
                   request.cookies.get('privy-token') ||
                   request.headers.get('authorization')
    
    if (!hasAuth) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  
  return response
}

export const config = {
  matcher: [
    // Aplicar middleware a todas las rutas excepto archivos estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}