import { z } from 'zod'

// ==============================================
// VALIDACIONES DE ENTRADA Y SANITIZACIÓN
// ==============================================

/**
 * Sanitiza strings para prevenir inyección XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .replace(/[<>]/g, '') // Remover caracteres HTML básicos
    .replace(/javascript:/gi, '') // Remover URLs javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .replace(/data:/gi, '') // Remover data URLs
    .trim()
}

/**
 * Sanitiza HTML básico permitiendo solo texto
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

/**
 * Valida que un email sea válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida dirección de wallet Ethereum
 */
export function isValidEthereumAddress(address: string): boolean {
  if (typeof address !== 'string') return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Valida que un número sea positivo y dentro de rangos razonables
 */
export function isValidPositiveNumber(num: unknown, max = Number.MAX_SAFE_INTEGER): boolean {
  const parsed = Number(num)
  return !isNaN(parsed) && parsed > 0 && parsed <= max
}

// ==============================================
// ESQUEMAS DE VALIDACIÓN CON ZOD
// ==============================================

// Schema para usuarios
export const userValidationSchema = z.object({
  id: z.number().positive().optional(),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .refine((val: string) => !/[<>\"'&]/.test(val), 'El nombre contiene caracteres no permitidos'),
  email: z.string()
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  telefono: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional(),
  wallet_address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Dirección de wallet inválida')
    .optional(),
  rol: z.enum(['admin', 'resident']),
  activo: z.boolean().optional().default(true)
})

// Schema para departamentos
export const departamentoValidationSchema = z.object({
  id: z.number().positive().optional(),
  numero: z.string()
    .min(1, 'El número es requerido')
    .max(10, 'El número no puede exceder 10 caracteres')
    .refine((val: string) => /^[A-Z0-9-]+$/i.test(val), 'Formato de número inválido'),
  piso: z.number()
    .int('El piso debe ser un número entero')
    .min(1, 'El piso debe ser al menos 1')
    .max(50, 'El piso no puede exceder 50'),
  dormitorios: z.number()
    .int('Los dormitorios deben ser un número entero')
    .min(1, 'Debe tener al menos 1 dormitorio')
    .max(10, 'No puede tener más de 10 dormitorios'),
  banos: z.number()
    .int('Los baños deben ser un número entero')
    .min(1, 'Debe tener al menos 1 baño')
    .max(10, 'No puede tener más de 10 baños'),
  area_m2: z.number()
    .positive('El área debe ser positiva')
    .min(20, 'El área mínima es 20 m²')
    .max(1000, 'El área máxima es 1000 m²'),
  renta_mensual: z.number()
    .positive('La renta debe ser positiva')
    .max(1000000, 'La renta no puede exceder $1,000,000'),
  mantenimiento_mensual: z.number()
    .positive('El mantenimiento debe ser positivo')
    .max(100000, 'El mantenimiento no puede exceder $100,000'),
  estado: z.enum(['disponible', 'ocupado', 'mantenimiento']),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .transform((val: string | undefined) => val ? sanitizeHtml(val) : undefined),
  servicios: z.array(z.string().max(50)).optional(),
  imagenes: z.array(z.string().url('URL de imagen inválida')).optional(),
  activo: z.boolean().optional().default(true)
})

// Schema para solicitudes de renta
export const solicitudRentaValidationSchema = z.object({
  id: z.number().positive().optional(),
  residente_id: z.number().positive('ID de residente requerido'),
  departamento_id: z.number().positive('ID de departamento requerido'),
  fecha_solicitud: z.string().datetime('Fecha inválida').optional(),
  fecha_inicio_deseada: z.string().datetime('Fecha de inicio inválida'),
  duracion_meses: z.number()
    .int('La duración debe ser un número entero')
    .min(1, 'Duración mínima es 1 mes')
    .max(60, 'Duración máxima es 60 meses'),
  mensaje: z.string()
    .max(1000, 'El mensaje no puede exceder 1000 caracteres')
    .optional()
    .transform((val: string | undefined) => val ? sanitizeHtml(val) : undefined),
  estado: z.enum(['pendiente', 'aprobada', 'rechazada']).optional().default('pendiente'),
  notas_admin: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .transform((val: string | undefined) => val ? sanitizeHtml(val) : undefined)
})

// ==============================================
// FUNCIONES DE VALIDACIÓN PARA APIS
// ==============================================

/**
 * Valida entrada de API de forma segura
 */
export function validateApiInput<T>(
  data: unknown, 
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Datos inválidos' }
  }
}

/**
 * Sanitiza parámetros de consulta
 */
export function sanitizeQueryParams(params: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Sanitizar key y value
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '')
      const cleanValue = sanitizeString(value)
      
      if (cleanKey && cleanValue.length < 1000) {
        sanitized[cleanKey] = cleanValue
      }
    }
  }
  
  return sanitized
}

/**
 * Valida parámetros de paginación
 */
export function validatePaginationParams(
  page?: string | number,
  limit?: string | number
): { page: number; limit: number } {
  const parsedPage = Math.max(1, Math.floor(Number(page) || 1))
  const parsedLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)))
  
  return {
    page: parsedPage,
    limit: parsedLimit
  }
}

// ==============================================
// VALIDACIONES DE SEGURIDAD ESPECÍFICAS
// ==============================================

/**
 * Verifica si una dirección de wallet está autorizada (admin o residente registrado)
 */
export function isAuthorizedWallet(
  walletAddress: string,
  authorizedWallets: string[] = []
): boolean {
  if (!isValidEthereumAddress(walletAddress)) {
    return false
  }
  
  const normalizedAddress = walletAddress.toLowerCase()
  return authorizedWallets.some(addr => addr.toLowerCase() === normalizedAddress)
}

/**
 * Valida token de autenticación JWT básico
 */
export function validateAuthToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Validación básica de formato JWT
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
  return jwtRegex.test(token)
}

/**
 * Genera un nonce criptográfico seguro para prevenir replay attacks
 */
export function generateSecureNonce(): string {
  const timestamp = Date.now().toString()
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return `${timestamp}-${randomBytes}`
}

/**
 * Valida formato de fecha ISO
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString
}

// ==============================================
// CONSTANTES DE SEGURIDAD
// ==============================================

export const SECURITY_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_STRING_LENGTH: 1000,
  MAX_ARRAY_LENGTH: 100,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
} as const