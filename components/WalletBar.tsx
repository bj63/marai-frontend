'use client'

import { ConnectWallet, useAddress } from '@thirdweb-dev/react'

export default function WalletBar() {
  const address = useAddress()

  return (
    <div className="flex items-center justify-between w-full glass px-4 py-3 rounded-xl">
      <div className="text-sm opacity-80">
        {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect your wallet'}
      </div>
      <ConnectWallet theme="dark" btnTitle="Connect Wallet" />
    </div>
  )
}
