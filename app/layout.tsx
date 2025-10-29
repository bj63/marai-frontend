import './globals.css'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { Inter, Poppins, Space_Grotesk } from 'next/font/google'
import { FederationProvider } from '@/components/FederationProvider'

const display = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

const accent = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-accent',
})

export const metadata = {
  title: 'Mirai Marketplace',
  description: 'Live Mirai marketplace with Core Resonance cards and reactive audio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '137', 10)

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${accent.variable}`}>
      <body className="bg-brand-midnight text-brand-mist antialiased">
        <ThirdwebProvider activeChain={chainId}>
          <FederationProvider>{children}</FederationProvider>
        </ThirdwebProvider>
      </body>
    </html>
  )
}
