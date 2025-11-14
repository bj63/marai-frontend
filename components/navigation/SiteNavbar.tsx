'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Sparkles } from 'lucide-react'

import AuthControls from '@/components/navigation/AuthControls'
import PrimaryNav from '@/components/navigation/PrimaryNav'

type SiteNavbarProps = {
  tone?: 'frosted' | 'transparent'
  activePath?: string
}

const signalChips = [
  { label: 'Hybrid', value: 'Tech + Soul' },
  { label: 'Mode', value: 'Human + Relational AI' },
  { label: 'Status', value: 'Live orchestration' },
]

export default function SiteNavbar({ tone = 'frosted', activePath }: SiteNavbarProps) {
  const pathname = usePathname()
  const navPath = activePath ?? pathname

  return (
    <header className={`site-navbar ${tone === 'transparent' ? 'site-navbar--transparent' : ''}`}>
      <div className="site-navbar__halo" aria-hidden />
      <div className="site-navbar__inner">
        <div className="site-navbar__row">
          <Link href="/" className="site-navbar__brand" aria-label="MarAI home">
            <span className="site-navbar__brand-mark">
              <span className="site-navbar__brand-mark-glow" />
              <Image
                src="/marai-logo.svg"
                alt="MarAI fractal magnolia"
                width={56}
                height={56}
                className="h-10 w-10"
                priority
              />
            </span>
            <div>
              <p className="site-navbar__brand-title">MarAI</p>
              <p className="site-navbar__brand-subtitle">Where light learns to feel</p>
            </div>
          </Link>

          <PrimaryNav activePath={navPath ?? undefined} />

          <div className="site-navbar__actions">
            <Link href="/admin" className="button-secondary">
              <Sparkles className="h-4 w-4" />
              Admin hub
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <AuthControls />
          </div>
        </div>

        <div className="site-navbar__meta" aria-label="Platform signals">
          {signalChips.map((chip) => (
            <div key={chip.label} className="site-navbar__chip">
              <span>{chip.label}</span>
              <span>{chip.value}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
