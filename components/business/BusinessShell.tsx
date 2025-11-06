'use client'

import { Building2, ChartBar, FolderKanban, Library, Sparkles, Users2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, type ComponentType, type ReactNode } from 'react'
import { BusinessDataProvider, useBusinessData } from '@/components/business/BusinessDataContext'
import SentimentBadge from '@/components/business/SentimentBadge'
import type { BusinessNavSection, BusinessProfile } from '@/types/business'

interface BusinessShellProps {
  company: BusinessProfile
  children: ReactNode
}

interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  key: BusinessNavSection
}

const navigation: NavItem[] = [
  { label: 'Overview', href: '/business', icon: Building2, key: 'overview' },
  { label: 'Planner', href: '/business/planner', icon: FolderKanban, key: 'planner' },
  { label: 'Posts', href: '/business/posts', icon: Sparkles, key: 'posts' },
  { label: 'Insights', href: '/business/insights', icon: ChartBar, key: 'insights' },
  { label: 'Team', href: '/business/team', icon: Users2, key: 'team' },
  { label: 'Assets', href: '/business/assets', icon: Library, key: 'assets' },
  { label: 'Analytics', href: '/business/analytics', icon: ChartBar, key: 'analytics' },
]

const TopBar = () => {
  const { company, sentiment } = useBusinessData()
  const dominant = sentiment.dominant

  return (
    <header className="sticky top-0 z-20 flex w-full flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/70 px-8 py-5 backdrop-blur">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pro Mode</p>
        <h1 className="text-2xl font-semibold text-white">{company.name}</h1>
        <p className="text-sm text-slate-400">{company.tagline}</p>
      </div>
      <div className="flex items-center gap-3">
        {dominant ? (
          <SentimentBadge label={dominant.label} confidence={dominant.confidence} />
        ) : (
          <SentimentBadge label="Calibrating" confidence={0.42} muted />
        )}
        <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
          Create campaign
        </button>
        <button className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
          Invite teammate
        </button>
      </div>
    </header>
  )
}

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 flex-col border-r border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300 md:flex">
      <p className="mb-6 text-xs uppercase tracking-[0.4em] text-slate-500">Navigation</p>
      <nav className="flex flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                isActive
                  ? 'bg-white/10 text-white shadow-[0_0_25px_rgba(148,163,184,0.25)]'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
        <p className="font-semibold text-white">Need agency mode?</p>
        <p className="mt-2 text-slate-400">Switch organisations, manage billing, and unlock multi-brand rituals.</p>
        <Link href="/settings" className="mt-3 inline-flex text-emerald-300 hover:text-emerald-200">
          Go to settings →
        </Link>
      </div>
    </aside>
  )
}

const ShellChrome = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-6 pb-12 pt-8 md:px-12">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function BusinessShell({ company, children }: BusinessShellProps) {
  const memoisedCompany = useMemo(() => company, [company])
  return (
    <BusinessDataProvider company={memoisedCompany}>
      <ShellChrome>{children}</ShellChrome>
    </BusinessDataProvider>
  )
}
