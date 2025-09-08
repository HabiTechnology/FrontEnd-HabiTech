# 🔧 Configuración de Alchemy para Sepolia

## 📋 Pasos para configurar Alchemy

### 1. **Crear cuenta en Alchemy**
1. Ve a https://www.alchemy.com/
2. Regístrate o inicia sesión
3. Crea un nuevo proyecto

### 2. **Configurar proyecto para Sepolia**
1. Clic en "Create new app"
2. Selecciona:
   - **Chain**: Ethereum
   - **Network**: Sepolia (testnet)
   - **Name**: HabiTech-Sepolia
3. Clic en "Create app"

### 3. **Obtener tu API Key**
1. En el dashboard, clic en tu app "HabiTech-Sepolia"
2. Clic en "View Key"
3. Copia la **HTTP URL** que se ve así:
   ```
   https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY_HERE
   ```

### 4. **Actualizar .env.local**
Reemplaza `YOUR_ALCHEMY_API_KEY_HERE` en tu `.env.local`:

```bash
# Blockchain Configuration - Sepolia Testnet con Alchemy
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY_AQUI
```

### 5. **Obtener ETH de prueba para Sepolia**
Necesitarás ETH de Sepolia para:
- Deployar el contrato
- Ejecutar transacciones

**Faucets de Sepolia ETH:**
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/
- https://sepolia-faucet.pk910.de/

### 6. **Deployar tu contrato en Sepolia**
1. Usa Remix IDE (https://remix.ethereum.org)
2. Conecta a Sepolia
3. Deploy el contrato `HabiTechAccess.sol`
4. Actualiza la dirección en `.env.local`

## 🎯 Ventajas de usar Sepolia

### ✅ **Para desarrollo:**
- **Gratuito** - ETH de prueba sin costo
- **Rápido** - Transacciones más rápidas que mainnet
- **Estable** - Red de prueba oficial de Ethereum
- **Debugging** - Etherscan para Sepolia disponible

### ✅ **Para tu proyecto:**
- **Pruebas seguras** - Sin riesgo de perder dinero real
- **Iteración rápida** - Deploy y prueba fácilmente
- **Experiencia real** - Comportamiento similar a mainnet
- **Monitoreo** - Herramientas completas de desarrollo

## 🔗 Enlaces útiles

- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Remix IDE**: https://remix.ethereum.org/
- **MetaMask Setup**: Agregar red Sepolia a MetaMask

## 🚀 Próximos pasos

1. ✅ Configurar Alchemy (seguir pasos arriba)
2. ✅ Actualizar .env.local con tu API key
3. 🔄 Deploy contrato en Sepolia
4. 🔄 Actualizar dirección del contrato
5. 🎉 ¡Listo para probar!

---

**Nota**: Una vez que tengas todo funcionando en Sepolia, migrar a mainnet será solo cambiar la configuración de red.
