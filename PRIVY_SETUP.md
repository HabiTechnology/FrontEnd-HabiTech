# Configuración de Privy para HabiTech

## Resumen de la implementación

Se ha implementado Privy como sistema de autenticación de wallets para HabiTech. Esto reemplaza la implementación anterior que utilizaba `window.ethereum` directamente.

## Cambios realizados

### 1. Instalación y configuración
- ✅ Privy ya estaba instalado en `package.json`: `@privy-io/react-auth`
- ✅ Se configuró el `PrivyProvider` en `app/layout.tsx`
- ✅ Se creó un contexto de autenticación personalizado que integra con Privy

### 2. Archivos modificados

#### `app/layout.tsx`
- Agregado `PrivyProvider` con configuración para modo oscuro
- Integrado con el contexto de autenticación personalizado

#### `lib/auth-context-privy.tsx`
- Nuevo contexto que utiliza hooks de Privy (`usePrivy`, `useWallets`)
- Manejo de autorización basado en wallet específica
- Gestión de sesiones con localStorage y sessionStorage

#### `app/login/page.tsx`
- Simplificado para usar el contexto de autenticación
- Eliminado código manual de `window.ethereum`
- UI mejorada con mejor manejo de errores

#### `components/protected-route.tsx`
- Simplificado para usar el nuevo contexto
- Mejor UX durante carga y estados de error

#### `components/dashboard/sidebar/index.tsx`
- Botón de logout actualizado para usar Privy

### 3. Variables de entorno necesarias

Crear/actualizar `.env.local`:

```env
# Privy Configuration - Obtener de https://dashboard.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=tu_app_id_de_privy

# Admin wallet autorizada (reemplazar con la dirección real)
NEXT_PUBLIC_ADMIN_WALLET=0x1234567890123456789012345678901234567890
```

## Pasos para configurar Privy

### 1. Crear cuenta en Privy
1. Ir a https://dashboard.privy.io
2. Crear una cuenta o iniciar sesión
3. Crear una nueva aplicación

### 2. Configurar la aplicación
1. En el dashboard de Privy:
   - Configurar el dominio de desarrollo: `http://localhost:3001`
   - Habilitar login con wallets
   - Configurar el tema oscuro si se desea
2. Copiar el `App ID` y agregarlo a `.env.local`

### 3. Configurar wallet autorizada
1. Reemplazar `NEXT_PUBLIC_ADMIN_WALLET` en `.env.local` con la dirección de wallet real
2. Esta wallet será la única autorizada para acceder al sistema

## Cómo funciona

1. **Login**: Usuario hace clic en "Conectar Wallet"
2. **Privy**: Abre modal de conexión de wallet
3. **Verificación**: Sistema verifica si la wallet conectada está autorizada
4. **Autorización**: Si es autorizada, otorga acceso; si no, desconecta automáticamente
5. **Sesión**: Mantiene la sesión activa hasta logout o recarga de página

## Características de seguridad

- ✅ Solo wallets autorizadas pueden acceder
- ✅ Verificación automática de permisos
- ✅ Desconexión automática de wallets no autorizadas
- ✅ Limpieza de sesión en logout
- ✅ Protección de rutas del dashboard

## Próximos pasos recomendados

1. **Configurar Privy real**: Reemplazar los placeholders con valores reales
2. **Testing**: Probar con diferentes wallets
3. **Múltiples wallets**: Extender para soportar múltiples wallets autorizadas
4. **Roles**: Implementar sistema de roles más granular
5. **Logging**: Agregar logging de eventos de autenticación

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build para verificar errores
npm run build

# Ver logs en tiempo real
# Revisar consola del navegador para logs de autenticación
```

## Troubleshooting

### Error: "App ID not found"
- Verificar que `NEXT_PUBLIC_PRIVY_APP_ID` esté configurado correctamente
- Confirmar que el App ID existe en dashboard de Privy

### Error: "Wallet not authorized"
- Verificar que `NEXT_PUBLIC_ADMIN_WALLET` tenga la dirección correcta
- Confirmar que la wallet esté conectada en el navegador

### Build errors
- Verificar que todas las importaciones estén correctas
- Confirmar que Privy esté instalado: `npm install @privy-io/react-auth`
