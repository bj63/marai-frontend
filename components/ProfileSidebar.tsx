'use client'

import { useEffect, useState } from 'react'
import WalletBar from './WalletBar'
import { analyzeMessage } from '@/lib/api'
import { handleError } from '@/lib/errorHandler'
import PersonaCard from './PersonaCard'
import BrandPhotoSpotlight from './BrandPhotoSpotlight'

export default function ProfileSidebar() {
  const [aura, setAura] = useState('hsl(180,85%,60%)')
  const [personality, setPersonality] = useState<Record<string, number>>({})
  const [loadingPersona, setLoadingPersona] = useState(true)
  const [personaError, setPersonaError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoadingPersona(true)
    setPersonaError(null)

    analyzeMessage('Hello Mirai')
      .then((data) => {
        if (!active) return
        if (data?.aura) {
          setAura(data.aura)
        }
        setPersonality(data?.personality || {})
      })
      .catch((err: unknown) => {
        if (!active) return
        const message = handleError(err, 'ProfileSidebar.analyzeMessage', 'Unable to sync aura data')
        setPersonaError(message)
      })
      .finally(() => {
        if (!active) return
        setLoadingPersona(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <aside className="w-full md:w-[360px] p-4 space-y-4">
      <WalletBar />
      <div className="glass rounded-xl p-4 text-sm text-brand-mist/80">
        <div className="text-xs uppercase tracking-[0.35em] text-brand-mist/60">MiraiCoin (MRC)</div>
        <p className="mt-1 text-[0.85rem] text-white">Wallet sync disabled</p>
        <p className="mt-1 text-xs">
          On-chain balances will repopulate here once the Web3 provider returns. For now, founders can request manual
          adjustments via{' '}
          <a href="mailto:founders@mirai.ai" className="text-brand-magnolia underline">
            founders@mirai.ai
          </a>
          .
        </p>
      </div>
      <PersonaCard aura={aura} personality={personality} loading={loadingPersona} error={personaError} />
      <BrandPhotoSpotlight />
    </aside>
  )
}
