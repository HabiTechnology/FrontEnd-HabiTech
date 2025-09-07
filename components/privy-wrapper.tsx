"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

interface PrivyWrapperProps {
  children: ReactNode
}

export function PrivyWrapper({ children }: PrivyWrapperProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ['wallet', 'email', 'sms'],
        appearance: {
          theme: 'dark',
          accentColor: '#007BFF',
          logo: '/placeholder-logo.svg'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        },
        walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      }}
    >
      {children}
    </PrivyProvider>
  )
}
