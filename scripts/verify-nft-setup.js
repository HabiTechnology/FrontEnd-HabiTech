// ===================================================
// 🔍 SCRIPT DE VERIFICACIÓN DEL SISTEMA NFT
// ===================================================
// Ejecuta: node scripts/verify-nft-setup.js

const https = require('https');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║        🔍 VERIFICACIÓN DEL SISTEMA NFT                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const checks = {
  database: '⏳',
  pinata: '⏳',
  contract: '⏳',
  wallet: '⏳',
  rpc: '⏳'
};

// 1. Verificar Base de Datos
async function checkDatabase() {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'nft_claim_tokens'
    `;
    
    if (result[0].count > 0) {
      checks.database = '✅';
      console.log('✅ Base de datos: Tabla nft_claim_tokens existe');
    } else {
      checks.database = '❌';
      console.log('❌ Base de datos: Tabla nft_claim_tokens NO existe');
      console.log('   → Visita: http://localhost:3000/api/db/migrate-nft');
    }
  } catch (error) {
    checks.database = '❌';
    console.log('❌ Base de datos: Error de conexión');
    console.log('   →', error.message);
  }
}

// 2. Verificar Pinata
async function checkPinata() {
  const jwt = process.env.PINATA_JWT;
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
  
  if (!jwt) {
    checks.pinata = '❌';
    console.log('❌ Pinata: PINATA_JWT no configurado');
    console.log('   → Obtén tu JWT en: https://app.pinata.cloud/developers/api-keys');
    return;
  }
  
  if (!gateway) {
    checks.pinata = '⚠️';
    console.log('⚠️  Pinata: NEXT_PUBLIC_PINATA_GATEWAY no configurado (usando default)');
  }
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.pinata.cloud',
      path: '/data/testAuthentication',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          checks.pinata = '✅';
          console.log('✅ Pinata: JWT válido y autenticado');
          if (gateway) {
            console.log(`   Gateway: ${gateway}`);
          }
        } else {
          checks.pinata = '❌';
          console.log('❌ Pinata: JWT inválido o expirado');
          console.log('   → Genera nuevo JWT en Pinata');
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      checks.pinata = '❌';
      console.log('❌ Pinata: Error de conexión');
      console.log('   →', error.message);
      resolve();
    });
    
    req.end();
  });
}

// 3. Verificar Contract Address
function checkContract() {
  const address = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  
  if (!address) {
    checks.contract = '❌';
    console.log('❌ Smart Contract: NEXT_PUBLIC_NFT_CONTRACT_ADDRESS no configurado');
    console.log('   → Agrega la dirección del contrato desplegado');
    return;
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    checks.contract = '❌';
    console.log('❌ Smart Contract: Dirección inválida');
    console.log('   → Debe ser formato: 0x1234567890abcdef...');
    return;
  }
  
  checks.contract = '✅';
  console.log('✅ Smart Contract: Dirección configurada');
  console.log(`   Address: ${address}`);
  console.log(`   Etherscan: https://sepolia.etherscan.io/address/${address}`);
}

// 4. Verificar Wallet Deployer
function checkWallet() {
  const privateKey = process.env.PRIVATE_KEY_DEPLOYER;
  
  if (!privateKey) {
    checks.wallet = '❌';
    console.log('❌ Wallet Deployer: PRIVATE_KEY_DEPLOYER no configurado');
    console.log('   → Agrega la private key de la wallet que mintea');
    return;
  }
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    checks.wallet = '⚠️';
    console.log('⚠️  Wallet Deployer: Formato de private key posiblemente incorrecto');
    console.log('   → Debe ser 64 caracteres hexadecimales');
    return;
  }
  
  checks.wallet = '✅';
  console.log('✅ Wallet Deployer: Private key configurada');
  console.log('   ⚠️  IMPORTANTE: Esta wallet debe tener ETH en Sepolia para gas');
}

// 5. Verificar RPC
async function checkRPC() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  
  if (!rpcUrl) {
    checks.rpc = '❌';
    console.log('❌ RPC Sepolia: SEPOLIA_RPC_URL no configurado');
    console.log('   → Usa Alchemy: https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY');
    return;
  }
  
  return new Promise((resolve) => {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    });
    
    const url = new URL(rpcUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.result) {
            const blockNumber = parseInt(json.result, 16);
            checks.rpc = '✅';
            console.log('✅ RPC Sepolia: Conectado');
            console.log(`   Bloque actual: ${blockNumber.toLocaleString()}`);
          } else {
            checks.rpc = '❌';
            console.log('❌ RPC Sepolia: Respuesta inválida');
          }
        } catch (error) {
          checks.rpc = '❌';
          console.log('❌ RPC Sepolia: Error parseando respuesta');
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      checks.rpc = '❌';
      console.log('❌ RPC Sepolia: Error de conexión');
      console.log('   →', error.message);
      resolve();
    });
    
    req.write(body);
    req.end();
  });
}

// Ejecutar todas las verificaciones
async function runChecks() {
  console.log('Ejecutando verificaciones...\n');
  
  await checkDatabase();
  console.log('');
  
  await checkPinata();
  console.log('');
  
  checkContract();
  console.log('');
  
  checkWallet();
  console.log('');
  
  await checkRPC();
  console.log('');
  
  // Resumen
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 RESUMEN                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`  Base de Datos:     ${checks.database}`);
  console.log(`  Pinata IPFS:       ${checks.pinata}`);
  console.log(`  Smart Contract:    ${checks.contract}`);
  console.log(`  Wallet Deployer:   ${checks.wallet}`);
  console.log(`  RPC Sepolia:       ${checks.rpc}`);
  
  const allGood = Object.values(checks).every(c => c === '✅');
  
  if (allGood) {
    console.log('\n🎉 ¡TODO LISTO! El sistema está completamente configurado.');
    console.log('   Puedes empezar a generar PDFs con QR para NFTs.');
  } else {
    console.log('\n⚠️  Hay configuraciones pendientes.');
    console.log('   Revisa los puntos marcados con ❌ arriba.');
  }
  
  console.log('\n');
}

// Ejecutar
runChecks().catch(console.error);
