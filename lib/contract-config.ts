// Contract Configuration
export const CONTRACT_CONFIG = {
  // Contract addresses (update after deployment)
  HABITECH_ACCESS: process.env.NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT || '0x0000000000000000000000000000000000000000',
  
  // Network configuration
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '137'),
  CHAIN_NAME: process.env.NEXT_PUBLIC_CHAIN_NAME || 'Polygon',
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com',
  
  // Development settings
  ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
} as const

// Network configuration for Viem - Sepolia Testnet
export const NETWORK_CONFIG = {
  id: CONTRACT_CONFIG.CHAIN_ID,
  name: CONTRACT_CONFIG.CHAIN_NAME,
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [CONTRACT_CONFIG.RPC_URL],
    },
    public: {
      http: [CONTRACT_CONFIG.RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sepolia Etherscan',
      url: 'https://sepolia.etherscan.io',
    },
  },
} as const

// Role mappings
export const USER_ROLES = {
  ADMIN: 1,
  RESIDENT: 2,
} as const

export const ROLE_NAMES = {
  [USER_ROLES.ADMIN]: 'admin',
  [USER_ROLES.RESIDENT]: 'resident',
} as const

// Contract validation
export function isContractConfigured(): boolean {
  return CONTRACT_CONFIG.HABITECH_ACCESS !== '0x0000000000000000000000000000000000000000'
}

// Environment helpers
export function isDemoMode(): boolean {
  return CONTRACT_CONFIG.ENABLE_DEMO_MODE || !isContractConfigured()
}

export function isDevelopment(): boolean {
  return CONTRACT_CONFIG.ENVIRONMENT === 'development'
}

// Logging helper
export function contractLog(message: string, data?: any) {
  if (isDevelopment()) {
    console.log(`[Contract] ${message}`, data || '')
  }
}
