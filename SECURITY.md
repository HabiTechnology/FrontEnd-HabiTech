# 🔒 GUÍA DE SEGURIDAD - HABITECH

Esta guía documenta todas las medidas de seguridad implementadas en la aplicación HabiTech.

## 📋 Índice

1. [Configuración HTTPS y Headers de Seguridad](#https-y-headers)
2. [Middleware de Seguridad](#middleware)
3. [Validación y Sanitización de Datos](#validacion)
4. [Autenticación Blockchain Segura](#autenticacion)
5. [Protección de APIs](#apis)
6. [Gestión de Sesiones](#sesiones)
7. [Variables de Entorno](#variables)
8. [Componentes de Seguridad](#componentes)
9. [Checklist de Deployment](#deployment)
10. [Monitoreo y Logs](#monitoreo)

---

## 🔐 1. HTTPS y Headers de Seguridad {#https-y-headers}

### Configuración en `next.config.ts`

```typescript
// Headers de seguridad implementados:

- Strict-Transport-Security: Fuerza HTTPS
- X-XSS-Protection: Protege contra XSS
- X-Content-Type-Options: Previene MIME sniffing  
- X-Frame-Options: Protege contra clickjacking
- Content-Security-Policy: Política de contenido estricta
- Referrer-Policy: Control de información de referencia
- Permissions-Policy: Restringe APIs del navegador
```

### Redirecciones HTTPS Automáticas

- En producción, automáticamente redirige HTTP → HTTPS
- Verifica headers `x-forwarded-proto`
- Compatible con Vercel y otros hosting providers

---

## 🛡️ 2. Middleware de Seguridad {#middleware}

### Archivo: `middleware.ts`

**Funcionalidades implementadas:**

✅ **Validación de Origen (CSRF Protection)**
- Verifica que las requests vengan de dominios autorizados
- Bloquea requests cross-origin maliciosas

✅ **Validación de Métodos HTTP**
- Solo permite métodos específicos por ruta
- Rechaza métodos no autorizados

✅ **Protección contra DoS**
- Límite de tamaño de payload (10MB)
- Validación de Content-Length

✅ **Detección de Bots Maliciosos**
- Bloquea User-Agents sospechosos
- Lista negra configurable

✅ **Validación de Parámetros URL**
- Detecta patrones de inyección SQL
- Sanitiza parámetros automáticamente
- Límites de longitud

✅ **Autenticación Básica para Rutas Protegidas**
- Verifica cookies de sesión
- Headers de autorización
- Redirección automática al login

---

## 🔍 3. Validación y Sanitización {#validacion}

### Archivo: `lib/security-validation.ts`

**Schemas de Validación con Zod:**

- `userValidationSchema`: Usuarios y wallets
- `departamentoValidationSchema`: Departamentos  
- `solicitudRentaValidationSchema`: Solicitudes de renta

**Funciones de Sanitización:**

```typescript
sanitizeString(input)     // Remueve XSS básico
sanitizeHtml(input)       // Limpia HTML peligroso  
sanitizeQueryParams(obj)  // Limpia parámetros URL
validatePaginationParams() // Valida paginación
```

**Validaciones de Seguridad:**

- Direcciones Ethereum válidas
- Tokens JWT básicos  
- Fechas ISO válidas
- Nonces criptográficos seguros

---

## 🔐 4. Autenticación Blockchain Segura {#autenticacion}

### Sistema Híbrido: Privy + Smart Contract

**Flujo de Seguridad:**

1. **Conexión Privy**: Wallet authentication
2. **Verificación Contrato**: Rol en blockchain
3. **Validación Dirección**: Formato Ethereum válido
4. **Generación Sesión**: Nonce criptográfico único
5. **Monitoreo Actividad**: Auto-logout por inactividad

**Timeouts de Seguridad:**

- Sesión máxima: 24 horas
- Inactividad máxima: 4 horas  
- Verificación cada: 5 minutos
- Nonce único por sesión

**Protecciones Implementadas:**

✅ Validación de integridad de wallet address
✅ Prevención de replay attacks con nonces
✅ Limpieza automática de sesiones comprometidas
✅ Detección de manipulación del localStorage
✅ Auto-logout en cambios de wallet

---

## 🌐 5. Protección de APIs {#apis}

### Validaciones Implementadas

**Headers de Seguridad:**
- Origin validation para CSRF
- Content-Length limits
- Authorization headers required

**Validación de Entrada:**
- Zod schemas para todos los endpoints
- Sanitización automática de datos
- Type safety completo

**Ejemplo de API Segura:**

```typescript
// GET con validación
export async function GET(request: Request) {
  // 1. Sanitizar parámetros
  const sanitized = sanitizeQueryParams(params)
  
  // 2. Validar paginación
  const { page, limit } = validatePaginationParams(...)
  
  // 3. Verificar autenticación
  if (!authHeader && !sessionCookie) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }
  
  // 4. Ejecutar query segura
}
```

---

## 🔑 6. Gestión de Sesiones {#sesiones}

### Almacenamiento Seguro

**SessionStorage** (temporal):
- `habitech_session_nonce`: Nonce único
- `habitech_session_start`: Timestamp inicio

**LocalStorage** (persistente):
- Mínimo necesario para funcionamiento
- Validación de integridad continua

### Limpieza Automática

- Al cerrar sesión
- En errores de autenticación  
- Cuando se detecta manipulación
- En timeouts por inactividad
- Al cambiar de wallet

---

## 🔧 7. Variables de Entorno {#variables}

### Archivo: `.env`

**Variables Críticas de Seguridad:**

```bash
# Secrets (mínimo 32 caracteres)
SESSION_SECRET="your-super-secure-secret"
JWT_SECRET="your-jwt-secret"

# Database (SSL obligatorio en prod)
DATABASE_URL="postgresql://...?sslmode=require"

# Blockchain
NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT="0x..."

# Security Flags
NODE_ENV="production"
FORCE_HTTPS=true
SECURE_COOKIES=true
```

**⚠️ IMPORTANTE:**
- Nunca commitear `.env` real
- Rotar secrets regularmente
- Usar SSL en base de datos
- Verificar contratos desplegados

---

## 🛡️ 8. Componentes de Seguridad {#componentes}

### `SecureRouteGuard`

**Verificaciones Automáticas:**

✅ **Protocolo HTTPS** en producción
✅ **Integridad de sesión** con nonces
✅ **Conexión blockchain** activa
✅ **Permisos de rol** correctos  
✅ **Detección de tampering** en localStorage
✅ **Estado online/offline**

**Uso:**

```tsx
<SecureRouteGuard requiredRole="admin">
  <AdminDashboard />
</SecureRouteGuard>
```

**Hook de Estado:**

```tsx
const { 
  isSecure, 
  isOnline, 
  userRole, 
  hasBlockchainConnection 
} = useSecurityStatus()
```

---

## 🚀 9. Checklist de Deployment {#deployment}

### Pre-Deployment

- [ ] Configurar variables de entorno de producción
- [ ] Verificar certificado SSL válido
- [ ] Desplegar smart contract en mainnet
- [ ] Actualizar dirección del contrato
- [ ] Configurar dominio con HTTPS forzado
- [ ] Verificar conexión a base de datos con SSL
- [ ] Rotar todos los secrets
- [ ] Deshabilitar logs de debug

### Post-Deployment

- [ ] Verificar headers de seguridad
- [ ] Probar autenticación blockchain  
- [ ] Validar redirecciones HTTPS
- [ ] Monitorear logs de errores
- [ ] Verificar CSP (Content Security Policy)
- [ ] Probar en múltiples navegadores
- [ ] Validar timeout de sesiones

### Herramientas de Verificación

```bash
# Verificar headers de seguridad
curl -I https://habitech.app

# Verificar certificado SSL
openssl s_client -connect habitech.app:443

# Verificar CSP
# Usar herramientas del navegador (DevTools → Security)
```

---

## 📊 10. Monitoreo y Logs {#monitoreo}

### Eventos de Seguridad Monitoreados

**Autenticación:**
- Intentos de login fallidos
- Wallets no autorizadas  
- Sesiones expiradas
- Cambios de rol

**API:**
- Requests maliciosos bloqueados
- Errores de validación
- Payloads demasiado grandes
- Origins no autorizados

**Aplicación:**
- Errores de conexión blockchain
- Manipulación de localStorage  
- Timeouts de sesión
- Errores de CSP

### Configuración de Logs

```typescript
// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('[Security]', message)
}

// En producción: usar servicios como Sentry, LogRocket
```

---

## 🔄 Proceso de Actualización de Seguridad

### Frecuencia Recomendada

- **Secrets**: Cada 3 meses
- **Dependencias**: Semanalmente  
- **Revisión CSP**: Mensualmente
- **Audit completo**: Trimestralmente

### Comandos de Mantenimiento

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Verificar tipos TypeScript
npx tsc --noEmit

# Linter de seguridad
npm run lint
```

---

## 📞 Contacto y Soporte

Para reportar vulnerabilidades de seguridad o dudas:

- **Email**: security@habitech.app
- **Urgente**: Crear issue en GitHub con tag `security`
- **Documentación**: Esta guía se actualiza con cada release

---

## 📝 Changelog de Seguridad

### v1.0.0 (Actual)

✅ Implementación inicial completa:
- HTTPS forzado con headers de seguridad
- Middleware de validación robusto
- Sistema de autenticación blockchain híbrido
- Validación Zod en todas las APIs
- Gestión segura de sesiones con nonces
- Componente SecureRouteGuard
- Documentación completa
---

**🔒 La seguridad es responsabilidad de todos. Mantén esta guía actualizada y reporta cualquier vulnerabilidad detectada.**