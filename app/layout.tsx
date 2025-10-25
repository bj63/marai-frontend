import './globals.css'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { FederationProvider } from '@/components/FederationProvider'

export const metadata = {
  title: 'Mirai Marketplace',
  description: 'Live Mirai marketplace with Core Resonance cards and reactive audio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '137', 10)

  return (
    <html lang="en">
      <body>
        <ThirdwebProvider activeChain={chainId}>
          <FederationProvider>{children}</FederationProvider>
        </ThirdwebProvider>
      </body>
    </html>
  )
}
