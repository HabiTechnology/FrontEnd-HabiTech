// Script para verificar el owner del contrato NFT
require('dotenv').config();
const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

const contractABI = [
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function checkOwner() {
  try {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
    
    console.log('🔍 Verificando owner del contrato...');
    console.log('📍 Contrato:', contractAddress);
    
    const owner = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'owner'
    });

    console.log('\n✅ Owner actual del contrato:', owner);
    console.log('📝 Wallet deployer en .env:', process.env.PRIVATE_KEY_DEPLOYER);
    
    // Derivar la address de la private key
    const { privateKeyToAccount } = require('viem/accounts');
    const account = privateKeyToAccount(process.env.PRIVATE_KEY_DEPLOYER);
    
    console.log('📝 Address derivada de PRIVATE_KEY_DEPLOYER:', account.address);
    
    if (owner.toLowerCase() === account.address.toLowerCase()) {
      console.log('\n✅ ¡CORRECTO! La wallet en .env es el owner del contrato');
    } else {
      console.log('\n❌ ERROR: La wallet en .env NO es el owner del contrato');
      console.log('   Necesitas:');
      console.log('   1. Usar la private key del owner original, O');
      console.log('   2. Redesplegar el contrato con la wallet actual');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOwner();
