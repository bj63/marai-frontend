'use client'

import { ReactNode } from 'react'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { polygon } from '@thirdweb-dev/chains'
import { FederationProvider } from '@/components/FederationProvider'

export function Providers({ children }: { children: ReactNode }) {
    const thirdwebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
    const content = <FederationProvider>{children}</FederationProvider>

    if (!thirdwebClientId) {
        return content
    }

    return (
        <ThirdwebProvider clientId={thirdwebClientId} activeChain={polygon}>
            {content}
        </ThirdwebProvider>
    )
}
