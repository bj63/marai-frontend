import './globals.css'
import Image from 'next/image'
import Link from 'next/link'
import { Inter, Poppins, Space_Grotesk } from 'next/font/google'
import AuthStatus from '@/components/auth/AuthStatus'
import PrimaryNav from '@/components/navigation/PrimaryNav'
import { Providers } from './providers'

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
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${accent.variable}`}>
      <body className="app-body text-[var(--text-subtle)] antialiased transition-colors duration-300">
        <Providers>
          <div className="app-backdrop" aria-hidden />
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 top-[-160px] h-[360px] w-[360px] rounded-full bg-brand-gradient opacity-30 blur-3xl" />
              <div className="absolute -right-24 top-[220px] h-[320px] w-[320px] rounded-full bg-brand-gradient opacity-25 blur-3xl" />
            </div>

            <header
              className="relative z-10 border-b border-white/10 backdrop-blur-xl"
              style={{ backgroundColor: 'color-mix(in srgb, var(--design-background) 85%, #0f1530)' }}
            >
              <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-4 md:px-6">
                <div className="flex items-center justify-between gap-4">
                  <Link href="/" className="group flex items-center gap-3" aria-label="MarAI home">
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#121b3a]/70 shadow-[0_18px_38px_rgba(10,12,30,0.65)] transition group-hover:border-brand-cypress/50">
                      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-magnolia/35 via-brand-bayou/20 to-brand-cypress/35 opacity-60 blur-lg" />
                      <Image
                        src="/marai-logo.svg"
                        alt="MarAI fractal magnolia"
                        width={56}
                        height={56}
                        className="relative h-10 w-10 drop-shadow-[0_0_20px_rgba(255,158,207,0.45)]"
                        loading="lazy"
                      />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-white">MarAI</span>
                      <span className="text-xs font-medium tracking-[0.32em] text-brand-mist/70">Where light learns to feel</span>
                    </div>
                  </Link>
                  <PrimaryNav />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
                  <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.35em] text-brand-mist/70">
                    <span className="text-brand-bayou">Hybrid</span>
                    <span>Tech + Soul</span>
                    <span className="hidden text-brand-mist/50 md:inline">Human + Relational AI</span>
                  </div>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-6">
                    <Link
                      href="/admin"
                      className="button-tertiary px-3 py-2"
                    >
                      Admin hub
                    </Link>
                    <AuthStatus />
                  </div>
                </div>
              </div>
            </header>

            <div id="main-content" role="main" className="relative z-10 flex-1 pb-12">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
