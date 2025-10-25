'use client'

import { useMemo } from 'react'
import { useContract, useContractRead, Web3Button } from '@thirdweb-dev/react'
import { MIRAI_CARD, MIRAI_MARKETPLACE } from '@/lib/contracts'
import ThreeCard from './ThreeCard'
import { playEmotion, type EmotionKey } from './AudioEngine'

type MarketplaceGridProps = {
  emotion?: string
  color?: string
  intensity?: number
}

const emotionKeys: EmotionKey[] = ['joy', 'calm', 'anger', 'sadness', 'curiosity']

export default function MarketplaceGrid({ emotion = 'joy', color = 'hsl(60,90%,60%)', intensity = 0.6 }: MarketplaceGridProps) {
  const { contract: nft } = useContract(MIRAI_CARD, 'nft-collection')
  const { data: supply } = useContractRead(nft, 'totalSupply')

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
          <div className="opacity-70 text-sm">Listed • {supply?.toString() ?? '—'}</div>
          <Web3Button
            contractAddress={MIRAI_MARKETPLACE}
            action={(contract) => contract.call('buyCard', [1])}
            className="px-3 py-1 rounded-md glass hover:opacity-90"
          >
            Buy
          </Web3Button>
        </div>
      </div>
    </div>
  )
}
