'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Brain,
  Code2,
  Compass,
  Home,
  Mail,
  Menu,
  MessageCircle,
  Newspaper,
  ScanFace,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'

import type { LucideIcon } from 'lucide-react'

type NavItem = {
  label: string
  href: string
  description: string
  icon: LucideIcon
  badge?: string
  badgeTone?: 'new' | 'beta' | 'pro'
  requiresAuth?: boolean
  adminOnly?: boolean
  roles?: string[]
  section?: 'core' | 'pro'
}

type PrimaryNavProps = {
  activePath?: string
}

const badgeToneMap: Record<NonNullable<NavItem['badgeTone']>, string> = {
  new: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  beta: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  pro: 'bg-brand-magnolia/10 text-brand-magnolia border-brand-magnolia/30',
}

const normalizePath = (value: string | null | undefined) => {
  if (!value) return null
  if (value === '/') return '/'
  return value.replace(/\/+$/, '')
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    description: 'Overview and onboarding status',
    icon: Home,
    section: 'core',
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    description: 'Step-by-step profile setup',
    icon: Sparkles,
    requiresAuth: true,
    section: 'core',
  },
  {
    label: 'Feed',
    href: '/feed',
    description: 'Mood posts and AI reflections',
    icon: Newspaper,
    section: 'core',
  },
  {
    label: 'Explore',
    href: '/explore',
    description: 'Search profiles and posts',
    icon: Compass,
    section: 'core',
  },
  {
    label: 'Chat',
    href: '/chat',
    description: 'Conversations with Amaris',
    icon: MessageCircle,
    section: 'core',
  },
  {
    label: 'Developers',
    href: '/developers',
    description: 'Integrations and API manifest',
    icon: Code2,
    requiresAuth: true,
    roles: ['developer'],
    badge: 'Pro',
    badgeTone: 'pro',
    section: 'pro',
  },
  {
    label: 'Avatar',
    href: '/avatar',
    description: 'Real-time avatar presence',
    icon: ScanFace,
    section: 'core',
  },
  {
    label: 'Personality',
    href: '/personality',
    description: 'AI mood + personality tuning',
    icon: Brain,
    section: 'core',
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    description: 'Collectibles and token commerce',
    icon: ShoppingBag,
    section: 'core',
  },
  {
    label: 'Profile',
    href: '/profile',
    description: 'Account and persona management',
    icon: UserRound,
    requiresAuth: true,
    section: 'core',
  },
  {
    label: 'Notifications',
    href: '/notifications',
    description: 'Mentions and roster changes',
    icon: Bell,
    requiresAuth: true,
    section: 'core',
  },
  {
    label: 'Messages',
    href: '/messages',
    description: 'Direct collaboration threads',
    icon: Mail,
    requiresAuth: true,
    section: 'core',
  },
  {
    label: 'Settings',
    href: '/settings',
    description: 'Privacy and wallet configuration',
    icon: Settings,
    requiresAuth: true,
    section: 'core',
  },
  {
    label: 'Admin',
    href: '/admin',
    description: 'Team roster and permissions',
    icon: ShieldCheck,
    requiresAuth: true,
    adminOnly: true,
    roles: ['admin', 'founder'],
    badge: 'Ops',
    badgeTone: 'beta',
    section: 'pro',
  },
]

export default function PrimaryNav({ activePath }: PrimaryNavProps) {
  const currentPathname = usePathname()
  const resolvedPathname = useMemo(() => normalizePath(activePath ?? currentPathname), [activePath, currentPathname])
  const { user, hasRole, hasAnyRole, isPro } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const filteredItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.adminOnly && !hasRole('admin') && !hasRole('founder')) return false
      if (item.requiresAuth && !user) return false
      if (item.roles && item.roles.length > 0) {
        const allowed = hasAnyRole(item.roles)
        if (!allowed) return false
      }
      if (item.section === 'pro' && !isPro) return false
      return true
    })
  }, [hasAnyRole, hasRole, isPro, user])

  const coreItems = filteredItems.filter((item) => item.section !== 'pro')
  const proItems = filteredItems.filter((item) => item.section === 'pro')

  const isPathActive = useCallback(
    (href: string) => {
      if (!resolvedPathname) return false
      const normalizedHref = normalizePath(href) ?? href
      if (normalizedHref === '/') {
        return resolvedPathname === '/'
      }
      return resolvedPathname === normalizedHref || resolvedPathname.startsWith(`${normalizedHref}/`)
    },
    [resolvedPathname],
  )

  const renderBadge = (item: NavItem) => {
    if (!item.badge) return null
    const toneClass = item.badgeTone ? badgeToneMap[item.badgeTone] : 'bg-white/5 text-white border-white/20'

    return (
      <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-tight ${toneClass}`}>
        {item.badge}
      </span>
    )
  }

  const renderDesktopLink = (item: NavItem) => {
    const isActive = isPathActive(item.href)
    const Icon = item.icon

    return (
      <div key={item.href} className="group relative">
        <Link
          href={item.href}
          className={`group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
            isActive
              ? 'bg-white/10 text-white shadow-[0_8px_24px_rgba(8,10,32,0.55)]'
              : 'text-brand-mist/80 hover:text-white'
          }`}
          aria-current={isActive ? 'page' : undefined}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem] transition-colors ${
              isActive
                ? 'border-white/60 bg-white/15 text-white'
                : 'border-white/10 bg-white/5 text-brand-mist/70'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span>{item.label}</span>
          {renderBadge(item)}
        </Link>
        <span className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-[#0d142c]/95 px-3 py-1 text-[0.7rem] text-brand-mist/70 shadow-xl transition-opacity duration-300 group-hover:flex">
          {item.description}
        </span>
      </div>
    )
  }

  const renderMobileLink = (item: NavItem) => {
    const isActive = isPathActive(item.href)
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 transition-colors ${
          isActive
            ? 'border-white/30 bg-white/10 text-white'
            : 'border-white/10 bg-white/5 text-brand-mist/80 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold">{item.label}</span>
            <span className="text-[0.72rem] text-brand-mist/70">{item.description}</span>
          </div>
        </div>
        {renderBadge(item)}
      </Link>
    )
  }

  return (
    <nav aria-label="Primary">
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="button-tertiary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-tight"
          aria-expanded={mobileOpen}
          aria-controls="primary-nav-mobile"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Navigate
        </button>
        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                id="primary-nav-mobile"
                className="fixed inset-y-0 right-0 z-50 flex w-[min(320px,85vw)] flex-col gap-6 overflow-y-auto border-l border-white/10 bg-[#090f1e]/95 p-5 backdrop-blur-2xl"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-mist/70">Navigate</span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border border-white/10 p-2 text-brand-mist/80"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close menu</span>
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-mist/60">Core</span>
                  <div className="flex flex-col gap-2">{coreItems.map((item) => renderMobileLink(item))}</div>
                </div>
                {proItems.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-magnolia/80">
                      Pro experiences
                    </span>
                    <div className="flex flex-col gap-2">{proItems.map((item) => renderMobileLink(item))}</div>
                  </div>
                ) : null}
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="nav-rail hidden md:flex">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto px-1 py-1">
          {coreItems.map((item) => renderDesktopLink(item))}
        </div>
        {proItems.length > 0 ? (
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-brand-mist/65">Pro</span>
            {proItems.map((item) => renderDesktopLink(item))}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
