'use client'

import { ReactNode, useEffect } from 'react'
import { useMoaStore } from '@/lib/store'

const STORAGE_KEY = 'moa:federationId'

const createIdentifier = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }

    // Fallback for environments without randomUUID support
    return `moa-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export function FederationProvider({ children }: { children: ReactNode }) {
    const federationId = useMoaStore((state) => state.federationId)
    const setFederationId = useMoaStore((state) => state.setFederationId)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const storedId = window.localStorage.getItem(STORAGE_KEY)
        if (storedId) {
            if (!federationId) {
                setFederationId(storedId)
            }
            return
        }

        const generatedId = createIdentifier()
        window.localStorage.setItem(STORAGE_KEY, generatedId)
        setFederationId(generatedId)
    }, [federationId, setFederationId])

    return <>{children}</>
}
