import './globals.css'
import { Providers } from './providers'
import DeploymentBanner from '@/components/system/DeploymentBanner'
import AppChrome from '@/components/navigation/AppChrome'

export const metadata = {
  title: 'Mirai Marketplace',
  description: 'Live Mirai marketplace with Core Resonance cards and reactive audio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="font-display bg-background-light dark:bg-background-dark">
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="relative z-0 flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 top-[-160px] h-[360px] w-[360px] rounded-full bg-brand-gradient opacity-30 blur-3xl" />
              <div className="absolute -right-24 top-[220px] h-[320px] w-[320px] rounded-full bg-brand-gradient opacity-25 blur-3xl" />
            </div>

            <AppChrome>
              <DeploymentBanner />
              <div id="main-content" role="main" className="relative z-10 flex-1 pb-12">
                {children}
              </div>
            </AppChrome>
          </div>
        </Providers>
      </body>
    </html>
  )
}
