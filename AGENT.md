# AGENT.md — Contexto Global del Proyecto

## 🧭 Descripción General

**HabiTech** es una plataforma integral de gestión de edificios residenciales que integra tecnología blockchain (Web3) con un sistema tradicional de administración de propiedades. El proyecto resuelve la gestión descentralizada de pagos, servicios, residentes y operaciones administrativas en condominios y edificios.

**Usuarios objetivo:**
- Administradores de edificios
- Residentes de condominios
- Personal financiero y de mantenimiento
- Proveedores de servicios

**Propósito principal:** Digitalizar y automatizar la gestión completa de edificios residenciales mediante una interfaz web moderna, integrando autenticación Web3 (wallets crypto) con funcionalidades tradicionales de ERP inmobiliario.

## ⚙️ Arquitectura y Estructura de Carpetas

```
FrontEnd-HabiTech/
├── app/                          # Next.js App Router (páginas principales)
│   ├── api/                      # API Routes de Next.js
│   │   ├── auth/                 # Autenticación y sesiones
│   │   ├── pagos/               # Gestión de pagos y facturas
│   │   ├── residentes/          # CRUD de residentes
│   │   ├── departamentos/       # Gestión de departamentos
│   │   └── tienda/             # Marketplace interno
│   ├── dashboard/               # Panel principal post-login
│   ├── financiero/             # Dashboard financiero
│   ├── residentes/             # Gestión de residentes
│   ├── tienda/                 # Marketplace de productos/servicios
│   └── auth/                   # Páginas de autenticación
├── components/                  # Componentes React reutilizables
│   ├── auth/                   # Componentes de autenticación Web3
│   ├── dashboard/              # Componentes del panel principal
│   ├── ui/                     # Componentes base (botones, modales, etc.)
│   ├── tienda/                 # Componentes del marketplace
│   └── charts/                 # Componentes de gráficos y estadísticas
├── lib/                        # Utilidades y configuraciones
│   ├── auth/                   # Configuración Privy (Web3 Auth)
│   ├── db/                     # Conexión y queries a PostgreSQL
│   ├── pdf/                    # Generación de PDFs (facturas, reportes)
│   └── utils/                  # Funciones auxiliares
├── data/                       # Datos mock y tipos TypeScript
├── scripts/                    # Scripts de seguridad y build
└── public/                     # Assets estáticos
```

**Patrón arquitectónico:** Full-stack monolítico con Next.js, siguiendo arquitectura de componentes modulares y API Routes serverless.

## 🧱 Tecnologías y Dependencias

### **Frontend Principal**
- **Next.js 15.5.2** - Framework React con App Router
- **React 19** - Librería de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos utilitarios
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Iconografía SVG

### **Autenticación Web3**
- **Privy** - Proveedor de autenticación Web3/wallet
- **wagmi** - Hooks React para Ethereum
- **viem** - Cliente TypeScript para Ethereum
- **ethers** - Librería para blockchain Ethereum

### **Base de Datos y Backend**
- **PostgreSQL (Neon)** - Base de datos principal
- **Prisma** - ORM para TypeScript (potencial migración)
- **API Routes (Next.js)** - Endpoints serverless

### **Generación de Documentos**
- **jsPDF** - Generación de facturas y reportes PDF
- **html2canvas** - Conversión HTML a imagen

### **Visualización de Datos**
- **Chart.js** - Gráficos interactivos
- **React Chart.js 2** - Integración React para Chart.js

### **Desarrollo y Build**
- **ESLint** - Linter de código
- **PostCSS** - Procesador CSS
- **Vercel** - Plataforma de deployment

## 🔄 Flujo General del Sistema

### **1. Autenticación**
```
Usuario → Conecta Wallet (Privy) → Verificación blockchain → Sesión JWT → Dashboard
```

### **2. Gestión de Residentes**
```
Admin → CRUD Residentes → PostgreSQL → Sincronización con departamentos → Notificaciones
```

### **3. Sistema de Pagos**
```
Residente → Visualiza facturas → Procesa pago → Actualiza estado → Genera PDF → Notifica admin
```

### **4. Marketplace (Tienda)**
```
Usuario → Explora productos/servicios → Agrega al carrito → Pago con coins → Entrega/Servicio
```

### **5. Dashboard Financiero**
```
Admin → Visualiza métricas → Genera reportes → Exporta PDFs → Análisis de ingresos
```

**Blockchain Integration:**
- Red **Sepolia Testnet** para desarrollo
- **Smart contracts** para gestión de accesos
- **Wallet connect** vía WalletConnect Protocol
- **Ethereum address** como identificador único de usuario

## 🧩 Convenciones de Código y Buenas Prácticas

### **Nomenclatura**
- **Archivos:** `kebab-case` (factura-modal.tsx)
- **Componentes:** `PascalCase` (FacturaModal)
- **Variables/funciones:** `camelCase` (generarFacturaPDF)
- **Constantes:** `SCREAMING_SNAKE_CASE` (COLORES_CORPORATIVOS)
- **Tipos TypeScript:** `PascalCase` con sufijo `Type` o `Interface`

### **Estructura de Componentes**
```typescript
// Imports (externos primero, internos después)
import React from 'react'
import { Button } from '@/components/ui/button'

// Tipos/Interfaces
interface ComponentProps {
  title: string
  isVisible?: boolean
}

// Componente principal
export const ComponentName = ({ title, isVisible = true }: ComponentProps) => {
  // Hooks primero
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => {
    // Lógica del evento
  }
  
  // Early returns
  if (!isVisible) return null
  
  // JSX
  return (
    <div className="container mx-auto">
      {/* Contenido */}
    </div>
  )
}
```

### **Manejo de Errores**
- **API Routes:** Siempre devolver status HTTP apropiado
- **Componentes:** Error boundaries para errores críticos
- **Async/await:** Usar try-catch con logging detallado
- **Validación:** Validar inputs tanto frontend como backend

### **Base de Datos**
- **Nombres de tablas:** `snake_case` plural (usuarios, departamentos, pagos)
- **Columnas:** `snake_case` descriptivo (fecha_vencimiento, numero_documento)
- **Relaciones:** Usar foreign keys explícitas (*_id)
- **Índices:** Crear para columnas de búsqueda frecuente

### **Internacionalización**
- **Idioma principal:** Español (UTF-8 completo)
- **Soporte:** Acentos, ñ, símbolos especiales (€, $, ¿, ¡)
- **Fechas:** Formato `es-MX` (dd/mm/yyyy)
- **Números:** Formato local mexicano con separadores de miles

## 🧠 Contexto para Modelos de IA

### **Interpretación de este archivo**
Este documento es la **fuente de verdad** para cualquier IA trabajando en el proyecto. Debe consultarse antes de realizar cambios significativos para mantener coherencia arquitectónica.

### **Prioridades de desarrollo**
1. **Seguridad:** Validar inputs, sanitizar datos, proteger endpoints
2. **Experiencia de usuario:** Interfaces intuitivas, feedback inmediato
3. **Rendimiento:** Optimizar queries, lazy loading, compresión de assets
4. **Mantenibilidad:** Código modular, documentado, testeable
5. **Escalabilidad:** Componentes reutilizables, estructura flexible

### **Elementos críticos - NO MODIFICAR sin supervisión**
- **Configuración de autenticación** (Privy, JWT secrets)
- **Schema de base de datos** (migraciones requieren planning)
- **Endpoints de pagos** (impacto financiero directo)
- **Configuración de deployment** (vercel.json, next.config.js)
- **Variables de entorno** (DATABASE_URL, secrets)

### **Estilo y coherencia**
- **Mantener consistencia** en naming conventions establecidas
- **Usar componentes existentes** antes de crear nuevos
- **Seguir patrones** de error handling ya implementados
- **Respetar estructura** de carpetas y imports
- **Documentar cambios** significativos en comentarios JSDoc

### **Flujo de trabajo recomendado**
1. Analizar código existente relacionado
2. Verificar convenciones en archivos similares
3. Implementar siguiendo patrones establecidos
4. Probar funcionalidad completa
5. Documentar cambios relevantes

## 🔐 Variables y Configuración

### **Autenticación y Seguridad**
- `PRIVY_APP_SECRET` → Clave secreta para Privy Web3 auth
- `NEXTAUTH_SECRET` → Secreto para NextAuth.js sessions
- `JWT_SECRET` → Firma de tokens JWT personalizados
- `ENCRYPTION_KEY` → Cifrado de datos sensibles

### **Base de Datos**
- `DATABASE_URL` → Conexión PostgreSQL (Neon cloud)
- `DB_SSL_MODE` → Configuración SSL para conexión segura

### **Blockchain**
- `NEXT_PUBLIC_CHAIN_ID` → ID de red Ethereum (Sepolia: 11155111)
- `NEXT_PUBLIC_RPC_URL` → Endpoint RPC de Alchemy
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` → ID proyecto WalletConnect
- `NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT` → Dirección smart contract

### **Aplicación**
- `NEXT_PUBLIC_APP_URL` → URL base de la aplicación
- `NODE_ENV` → Entorno de ejecución (development/production)
- `ALLOWED_ORIGINS` → URLs permitidas para CORS

## 🚀 Próximas Extensiones o Plan de Crecimiento

### **Funcionalidades Planeadas**
- **Sistema de notificaciones** push y email
- **Chat/mensajería** entre residentes y administración
- **Reserva de espacios** comunes (salón de fiestas, gym, etc.)
- **Mantenimiento predictivo** con IoT sensors
- **Pagos crypto** nativos (USDC, ETH)

### **Optimizaciones Técnicas**
- **Migración a Prisma** ORM para mejor type safety
- **Implementar Redis** para caché y sesiones
- **API rate limiting** más granular
- **Websockets** para tiempo real
- **PWA capabilities** (offline-first)

### **Escalabilidad**
- **Microservicios** para módulos independientes
- **Docker containerization** para deployment
- **CDN integration** para assets estáticos
- **Multi-tenancy** para múltiples edificios
- **Backup automatizado** y disaster recovery

### **Integraciones Externas**
- **Pasarelas de pago** mexicanas (Stripe MX, Conekta)
- **APIs bancarias** para conciliación automática
- **Sistemas contables** (CONTPAQi, SAT)
- **Servicios de delivery** para marketplace
- **Platforms de comunicación** (WhatsApp Business API)

---

## 📝 Notas de Observación

### **Inconsistencias Detectadas**
- Mix de español/inglés en algunos nombres de variables
- Algunos componentes no siguen la estructura establecida
- Falta documentación JSDoc en funciones críticas
- Variables de entorno duplicadas entre .env y .env.local

### **Recomendaciones de Mejora**
- Estandarizar idioma en código (español para business logic, inglés para términos técnicos)
- Implementar tests unitarios para componentes críticos
- Crear storybook para documentar componentes UI
- Configurar pre-commit hooks para linting automático
- Establecer conventional commits para mejor tracking

---

*Documento generado: $(date) | Versión del proyecto: 1.0.0 | Actualizar cuando se realicen cambios arquitectónicos significativos*