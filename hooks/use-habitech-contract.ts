"use client"

import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { sepolia } from 'viem/chains' // Usando Sepolia testnet
import { getContract } from 'viem'

// ABI SIMPLIFICADO - Solo para autenticación/login
const HABITECH_ACCESS_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "isActiveAdmin",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "isActiveResident", 
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserName",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalAdmins", "type": "uint256"},
      {"internalType": "uint256", "name": "totalResidents", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAdmins",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllResidents",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Dirección del contrato (actualizar después del deploy)
const HABITECH_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT as `0x${string}` || "0x0000000000000000000000000000000000000000"

export function useHabiTechContract() {
  const { user, authenticated } = usePrivy()

  // Cliente público para lecturas
  const publicClient = createPublicClient({
    chain: sepolia, // Usando Sepolia testnet
    transport: http(process.env.NEXT_PUBLIC_RPC_URL)
  })

  // Cliente de wallet para escribir (cuando sea necesario)
  const walletClient = user?.wallet && typeof window !== 'undefined' && window.ethereum ? 
    createWalletClient({
      chain: sepolia,
      transport: custom((window as any).ethereum)
    }) : null

  // Contrato para lecturas
  const contract = getContract({
    address: HABITECH_CONTRACT_ADDRESS,
    abi: HABITECH_ACCESS_ABI,
    client: publicClient
  })

  const checkUserRole = async (address: string) => {
    if (!address || !contract) return null

    console.log('🔍 Verificando rol en blockchain para:', address)

    try {
      const [isAdmin, isResident] = await Promise.all([
        contract.read.isActiveAdmin([address as `0x${string}`]),
        contract.read.isActiveResident([address as `0x${string}`])
      ])

      if (isAdmin) {
        console.log('✅ Usuario autorizado como ADMIN')
        return 'admin'
      }
      if (isResident) {
        console.log('✅ Usuario autorizado como RESIDENT')
        return 'resident'
      }
      
      console.log('❌ Usuario NO AUTORIZADO en el contrato')
      return 'unauthorized'
      
    } catch (error) {
      console.error('💥 Error consultando contrato:', error)
      return 'error'
    }
  }

  const getUserInfo = async (address: string) => {
    if (!address || !contract) return null

    try {
      // Con el contrato simplificado, solo obtenemos el nombre
      const userName = await contract.read.getUserName([address as `0x${string}`])
      return {
        wallet: address,
        name: userName || 'Usuario',
        email: '',
        isActive: true,
        registeredAt: BigInt(Date.now()),
        userType: 1
      }
    } catch (error) {
      console.error('Error obteniendo nombre de usuario:', error)
      return {
        wallet: address,
        name: 'Usuario',
        email: '',
        isActive: true,
        registeredAt: BigInt(Date.now()),
        userType: 1
      }
    }
  }

  const getCommunityInfo = async () => {
    if (!contract) return null

    try {
      const stats = await contract.read.getStats()
      return {
        name: 'HabiTech Community',
        description: 'Comunidad de edificio inteligente',
        owner: '0x0000000000000000000000000000000000000000',
        isActive: true,
        createdAt: BigInt(Date.now()),
        totalAdmins: stats[0],
        totalResidents: stats[1]
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return null
    }
  }

  return {
    contract,
    checkUserRole,
    getUserInfo,
    getCommunityInfo,
    isContractConnected: !!contract && HABITECH_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"
  }
}
