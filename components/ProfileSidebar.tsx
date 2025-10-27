'use client'

import { useEffect, useState } from 'react'
import { useAddress, useContract, useTokenBalance } from '@thirdweb-dev/react'
import WalletBar from './WalletBar'
import { analyzeMessage } from '@/lib/api'
import { MIRAI_COIN } from '@/lib/contracts'
import PersonaCard from './PersonaCard'

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
      <PersonaCard aura={aura} personality={personality} address={address} />
    </aside>
  )
}
