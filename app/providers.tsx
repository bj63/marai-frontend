'use client'

import { ReactNode } from 'react'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { polygon } from '@thirdweb-dev/chains'
import { FederationProvider } from '@/components/FederationProvider'

const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThirdwebProvider clientId={THIRDWEB_CLIENT_ID} activeChain={polygon}>
            <FederationProvider>{children}</FederationProvider>
        </ThirdwebProvider>
    )
}
