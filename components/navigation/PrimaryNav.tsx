'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

type NavItem = {
  label: string
  href: string
  description: string
  requiresAuth?: boolean
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    description: 'Overview and onboarding status',
  },
  {
    label: 'Onboarding',
    href: '/onboarding',
    description: 'Step-by-step profile setup',
    requiresAuth: true,
  },
  {
    label: 'Feed',
    href: '/feed',
    description: 'Mood posts and AI reflections',
  },
  {
    label: 'Explore',
    href: '/explore',
    description: 'Search profiles and posts',
  },
  {
    label: 'Chat',
    href: '/chat',
    description: 'Conversations with Amaris',
  },
  {
    label: 'Avatar',
    href: '/avatar',
    description: 'Real-time avatar presence',
  },
  {
    label: 'Personality',
    href: '/personality',
    description: 'AI mood + personality tuning',
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    description: 'Collectibles and token commerce',
  },
  {
    label: 'Profile',
    href: '/profile',
    description: 'Account and persona management',
    requiresAuth: true,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    description: 'Mentions and roster changes',
    requiresAuth: true,
  },
  {
    label: 'Messages',
    href: '/messages',
    description: 'Direct collaboration threads',
    requiresAuth: true,
  },
  {
    label: 'Settings',
    href: '/settings',
    description: 'Privacy and wallet configuration',
    requiresAuth: true,
  },
  {
    label: 'Admin',
    href: '/admin',
    description: 'Team roster and permissions',
    requiresAuth: true,
    adminOnly: true,
  },
]

export default function PrimaryNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const canAccessAdmin = Boolean(user)
  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !canAccessAdmin) return false
    if (item.requiresAuth && !user) return false
    return true
  })

  const renderLink = (item: NavItem) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`group relative flex flex-col gap-1 rounded-2xl px-3 py-2 text-left transition-colors duration-300 ease-enter-expressive md:text-center ${
          isActive
            ? 'bg-brand-magnolia/10 text-brand-magnolia shadow-[0_0_18px_rgba(255,158,207,0.28)]'
            : 'text-brand-mist/80 hover:text-brand-magnolia'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.28em] md:tracking-[0.32em]">
          {item.label}
        </span>
        <span className="text-[0.65rem] text-brand-mist/60 md:hidden">{item.description}</span>
        <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-colors duration-300 ease-enter-expressive group-hover:border-brand-magnolia/45" />
      </Link>
    )
  }

  return (
    <nav className="relative">
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="button-tertiary px-3 py-2 text-[0.68rem]"
          aria-expanded={mobileOpen}
          aria-controls="primary-nav-mobile"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Navigate
        </button>
        {mobileOpen && (
          <div
            id="primary-nav-mobile"
            className="absolute right-0 z-20 mt-3 flex min-w-[240px] flex-col gap-2 rounded-xl border border-white/10 bg-[#0d142c]/95 p-3 shadow-xl"
          >
            {filteredItems.map((item) => renderLink(item))}
          </div>
        )}
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {filteredItems.map((item) => (
          <div key={item.href} className="group relative">
            {renderLink(item)}
            <span className="pointer-events-none absolute left-1/2 top-full hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0d142c]/90 px-2 py-1 text-[0.6rem] text-brand-mist/70 shadow-lg transition-opacity duration-300 ease-enter-expressive group-hover:flex">
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </nav>
  )
}
