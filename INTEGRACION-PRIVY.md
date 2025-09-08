# 🏢 HabiTech - Integración Privy + Smart Contracts

## ✅ Estado Actual

La integración completa entre **Privy** y **Smart Contracts** está implementada y funcionando. El proyecto compila correctamente y está listo para usar.

## 🚀 Características Implementadas

### 🔐 Autenticación con Privy
- ✅ Login con wallet (MetaMask, WalletConnect, etc.)
- ✅ Email + SMS authentication como respaldo
- ✅ Gestión de sessiones persistentes
- ✅ UI elegante con estados de carga y error

### 🔗 Integración con Smart Contracts
- ✅ Contrato `HabiTechAccess.sol` para gestión de roles
- ✅ Verificación de roles en blockchain (Admin/Resident)
- ✅ Hook personalizado para interacción con contratos
- ✅ Modo demo automático cuando no hay contrato

### 🛡️ Sistema de Roles y Permisos
- ✅ Roles: Admin, Resident, Unauthorized
- ✅ Componente `RoleGuard` para rutas protegidas
- ✅ Verificación automática de permisos
- ✅ Estados de error y carga manejados

### 🎨 Experiencia de Usuario
- ✅ Indicadores visuales de estado de autenticación
- ✅ Mensajes claros para cada estado (autorizado, no autorizado, cargando)
- ✅ Información de debug en desarrollo
- ✅ Fallbacks para errores de conexión

## 📋 Configuración Requerida

### 1. **Configurar Variables de Entorno**

En `.env.local`, ya tienes configurado Privy. Solo necesitas actualizar:

```bash
# ✅ YA CONFIGURADO - Privy
NEXT_PUBLIC_PRIVY_APP_ID=cmfa7m6aa007zl40d3k1rn8vd

# 🔄 ACTUALIZAR DESPUÉS DE DEPLOYMENT
NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT=0x0000000000000000000000000000000000000000

# ✅ YA CONFIGURADO - Blockchain
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com

# ✅ YA CONFIGURADO - Demo mode
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

### 2. **Deploy del Smart Contract**

#### Opción A: Deploy en Polygon (Recomendado)
```bash
# 1. Instalar Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Configurar Hardhat
npx hardhat init

# 3. Deploy a Polygon
npx hardhat run scripts/deploy.js --network polygon
```

#### Opción B: Deploy en testnet (Para pruebas)
```bash
# Deploy a Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai
```

### 3. **Actualizar Dirección del Contrato**

Una vez deployado, actualiza `.env.local`:
```bash
NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT=0xTU_DIRECCION_DEL_CONTRATO_AQUI
```

## 🔧 Cómo Usar

### **Modo Demo (Actual)**
- ✅ **Activado automáticamente** cuando no hay contrato configurado
- 🔐 **Todos los usuarios autenticados** se consideran Admin
- 🧪 **Perfecto para desarrollo** y testing

### **Modo Producción (Después del deploy)**
1. Deploy del contrato ✅
2. Actualizar `.env.local` con la dirección ✅
3. Registrar usuarios usando funciones de Admin:
   ```solidity
   // Registrar un admin
   contract.registerUser(walletAddress, "Admin Name", "admin@email.com", USER_ROLES.ADMIN)
   
   // Registrar un residente  
   contract.registerUser(walletAddress, "Resident Name", "resident@email.com", USER_ROLES.RESIDENT)
   ```

## 📁 Archivos Implementados

### **🔗 Blockchain Integration**
- `hooks/use-habitech-contract.ts` - Hook principal para interactuar con el contrato
- `hooks/use-auth-integrated.ts` - Hook que combina Privy + verificación de roles
- `lib/contract-config.ts` - Configuración de red y contratos
- `contracts/HabiTechAccess.sol` - Smart contract de roles

### **🔐 Authentication**
- `lib/auth-context-simple-fixed.tsx` - Contexto principal de autenticación
- `components/privy-login-button.tsx` - Botón de login con Privy
- `components/privy-wrapper.tsx` - Wrapper de configuración Privy

### **🛡️ Security & Routes**
- `components/role-guard.tsx` - Componente para proteger rutas
- `app/page.tsx` - Dashboard protegido con RoleGuard
- `app/login/page.tsx` - Página de login actualizada

## 🎯 Próximos Pasos

### **Inmediatos (Para Producción)**
1. 🚀 **Deploy del contrato** en Polygon
2. 🔧 **Actualizar variables de entorno**
3. 👥 **Registrar usuarios iniciales**

### **Mejoras Futuras**
1. 📱 **Panel de administración** para gestionar usuarios
2. 🔄 **Sync automático** de datos on-chain
3. 📊 **Analytics** de uso y acceso
4. 🔔 **Notificaciones** de cambios de roles

## 🐛 Debugging

### **Información de Debug (Solo en desarrollo)**
- ✅ **Indicador visual** en esquina inferior derecha
- 📊 **Muestra rol actual, permisos y wallet**
- 🔍 **Logs detallados** en consola del navegador

### **Estados Posibles**
- ⏳ `loading` - Verificando autenticación y roles
- ✅ `admin` - Usuario con permisos de administrador  
- 👥 `resident` - Usuario residente autorizado
- ❌ `unauthorized` - Wallet no registrada en sistema
- 💥 `error` - Error de conexión o verificación

## 🚀 Ejecutar el Proyecto

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar build
npm start
```

## 📞 Soporte

El sistema está completamente funcional. Si tienes problemas:

1. ✅ **Verifica** que Privy esté configurado correctamente
2. 🔍 **Revisa** las variables de entorno en `.env.local`
3. 🧪 **Usa el modo demo** para pruebas sin contrato
4. 📱 **Consulta** el indicador de debug en desarrollo

---

**¡El sistema está listo para usar! 🎉**
