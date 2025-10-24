'use client'

import { ReactNode } from 'react'
import { FederationProvider } from '@/components/FederationProvider'

export function Providers({ children }: { children: ReactNode }) {
    return <FederationProvider>{children}</FederationProvider>
}
