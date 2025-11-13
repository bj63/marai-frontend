'use client'

import { ReactNode } from 'react'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { Polygon } from '@thirdweb-dev/chains'
import { FederationProvider } from '@/components/FederationProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DesignThemeProvider } from '@/components/design/DesignThemeProvider'

const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
const ACTIVE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? Polygon.chainId)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      clientId={THIRDWEB_CLIENT_ID}
      activeChain={Number.isFinite(ACTIVE_CHAIN_ID) ? ACTIVE_CHAIN_ID : Polygon}
    >
      <FederationProvider>
        <AuthProvider>
          <DesignThemeProvider>{children}</DesignThemeProvider>
        </AuthProvider>
      </FederationProvider>
    </ThirdwebProvider>
  )
}
