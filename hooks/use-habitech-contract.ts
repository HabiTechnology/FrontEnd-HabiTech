"use client"

import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { sepolia } from 'viem/chains'
import { getContract } from 'viem'
import { useEffect, useMemo, useState } from 'react'

// ABI SIMPLIFICADO - Solo para autenticación/login
const HABITECH_ACCESS_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_admin", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" }
    ],
    "name": "addAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_resident", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" }
    ],
    "name": "addResident",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "removeUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
  const { user, authenticated } = usePrivy();
  // Eliminado: const [chainId, setChainId] = useState<number | null>(null);

  // Eliminado: lógica de detección de red

  // Cliente público para lecturas
  const publicClient = useMemo(() => createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_RPC_URL)
  }), []);

  // Cliente de wallet para escribir (siempre con la red actual)
  // Detect chainId from wallet if possible
  const [chain, setChain] = useState(sepolia);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && typeof window.ethereum.request === 'function') {
      window.ethereum.request({ method: 'eth_chainId' }).then((id: string) => {
        const hexId = id.startsWith('0x') ? id : '0x' + parseInt(id).toString(16);
        const chainIdNum = Number(hexId);
        setChain({
          id: chainIdNum,
          name: 'Custom',
          network: 'custom',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_RPC_URL || ''] }, public: { http: [process.env.NEXT_PUBLIC_RPC_URL || ''] } },
          blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
          testnet: true
        } as any); // Forzar tipo Chain
      });
    }
  }, []);
  const walletClient = useMemo(() => {
    if (user?.wallet && typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && typeof window.ethereum.request === 'function') {
      return createWalletClient({
        chain,
        transport: custom(window.ethereum as any)
      });
    }
    return null;
  }, [user?.wallet, chain]);

  // Contrato para lecturas
  const contract = getContract({
    address: HABITECH_CONTRACT_ADDRESS,
    abi: HABITECH_ACCESS_ABI,
    client: publicClient
  })

  // Métodos de escritura usando walletClient y la cuenta conectada
  const account = user?.wallet?.address as `0x${string}` | undefined;

  const addAdmin = async (admin: string, name: string) => {
    let selectedAccount = account;
    if (typeof window !== 'undefined' && window.ethereum && typeof window.ethereum.request === 'function') {
      // Solicitar autorización y obtener la cuenta seleccionada
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        selectedAccount = accounts[0].toLowerCase();
      }
    }
    if (!walletClient || !selectedAccount) throw new Error('No wallet client o account');
    // Validar que la cuenta seleccionada sea la misma que la conectada
    if (selectedAccount !== account?.toLowerCase()) {
      throw new Error('La cuenta seleccionada en MetaMask no coincide con la cuenta conectada en la app. Cambia la cuenta en MetaMask y recarga.');
    }
    return await walletClient.writeContract({
      address: HABITECH_CONTRACT_ADDRESS,
      abi: HABITECH_ACCESS_ABI,
      functionName: 'addAdmin',
      args: [admin as `0x${string}`, name],
      account,
      chain
    });
  };

  const addResident = async (resident: string, name: string) => {
    if (!walletClient || !account) throw new Error('No wallet client or account');
    return await walletClient.writeContract({
      address: HABITECH_CONTRACT_ADDRESS,
      abi: HABITECH_ACCESS_ABI,
      functionName: 'addResident',
      args: [resident as `0x${string}`, name],
      account,
      chain
    });
  };

  const removeUser = async (user: string) => {
    if (!walletClient || !account) throw new Error('No wallet client or account');
    return await walletClient.writeContract({
      address: HABITECH_CONTRACT_ADDRESS,
      abi: HABITECH_ACCESS_ABI,
      functionName: 'removeUser',
      args: [user as `0x${string}`],
      account,
      chain
    });
  };

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
    isContractConnected: !!contract && HABITECH_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    addAdmin,
    addResident,
    removeUser
  };
}
