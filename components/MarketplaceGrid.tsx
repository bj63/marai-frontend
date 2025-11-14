'use client'

import { useMemo } from 'react'
import { ShieldAlert } from 'lucide-react'
import ThreeCard from './ThreeCard'
import { playEmotion, type EmotionKey } from './AudioEngine'

const emotionKeys: EmotionKey[] = ['joy', 'calm', 'anger', 'sadness', 'curiosity']
type MarketplaceGridProps = {
  emotion?: string
  color?: string
  intensity?: number
}

export default function MarketplaceGrid({
  emotion = 'joy',
  color = 'hsl(60,90%,60%)',
  intensity = 0.6,
}: MarketplaceGridProps) {
  const entityId = useMemo(() => 'CORE_RESONANCE', [])

  const stats = useMemo(
    () => ({
      rarity: 3,
      energy: Math.max(0.2, intensity),
      creativity: 0.7,
    }),
    [intensity],
  )

  const emotionKey = (emotionKeys.includes(emotion as EmotionKey) ? emotion : 'curiosity') as EmotionKey

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div onMouseEnter={() => playEmotion(emotionKey, Math.min(1, intensity + 0.1))}>
        <ThreeCard color={color} emotion={emotion} intensity={intensity} stats={stats} />
        <div className="flex items-center justify-between mt-3">
          <div className="opacity-70 text-sm">Listings resume soon</div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#121530] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-mist/70"
            disabled
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Wallets off
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Core Resonance Entity</div>
            <div className="text-xs opacity-70 break-all">ID: {entityId}</div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/60">
            Wallet support paused
          </span>
        </div>
        <div className="text-xs leading-5 opacity-70">
          We paused blockchain reads and writes while the Web3 provider is disabled. Contracts stay live, but the interface will
          refresh listings once wallets are back online.
        </div>
      </div>
    </div>
  )
}
