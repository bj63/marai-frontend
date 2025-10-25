'use client'

import { useEffect, useState } from 'react'
import { useAddress, useContract, useTokenBalance } from '@thirdweb-dev/react'
import WalletBar from './WalletBar'
import { analyzeMessage } from '@/lib/api'
import { MIRAI_COIN } from '@/lib/contracts'

export default function ProfileSidebar() {
  const address = useAddress()
  const { contract } = useContract(MIRAI_COIN, 'token')
  const { data: balance } = useTokenBalance(contract, address)
  const [aura, setAura] = useState('hsl(180,85%,60%)')
  const [personality, setPersonality] = useState<Record<string, number>>({})

  useEffect(() => {
    analyzeMessage('Hello Mirai')
      .then((data) => {
        setAura(data.aura)
        setPersonality(data.personality || {})
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="w-full md:w-[360px] p-4 space-y-4">
      <WalletBar />
      <div className="glass rounded-xl p-4">
        <div className="text-xs opacity-60 mb-1">MiraiCoin (MRC)</div>
        <div className="text-2xl font-semibold">{balance?.displayValue ?? '0'} MRC</div>
      </div>
      <div className="glass rounded-xl p-0 overflow-hidden">
        <div
          className="h-28"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${aura} 0%, transparent 70%)`,
          }}
        />
        <div className="p-4">
          <div className="text-sm opacity-70">Personality</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(personality).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="opacity-60">{key}</span>
                <span>{Math.round(value * 100)}%</span>
              </div>
            ))}
            {Object.keys(personality).length === 0 && (
              <div className="col-span-2 text-xs opacity-50">Syncing aura data...</div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
