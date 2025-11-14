'use client'

import { ReactNode } from 'react'
import { FederationProvider } from '@/components/FederationProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DesignThemeProvider } from '@/components/design/DesignThemeProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FederationProvider>
      <AuthProvider>
        <DesignThemeProvider>{children}</DesignThemeProvider>
      </AuthProvider>
    </FederationProvider>
  )
}
