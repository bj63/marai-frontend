'use client'

import { Shield } from 'lucide-react'

export default function WalletBar() {
  return (
    <div className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
      <div className="inline-flex items-center gap-2 text-[0.85rem] font-semibold">
        <Shield className="h-4 w-4 text-brand-magnolia" /> Wallet support paused
      </div>
      <p className="text-xs text-brand-mist/70">
        We temporarily disabled the Web3 provider while we focus on Supabase auth reliability. Wallet balances and actions
        will light back up once the bridge returns.
      </p>
    </div>
  )
}
