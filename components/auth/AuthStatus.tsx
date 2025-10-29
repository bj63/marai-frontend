'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, LogIn, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useAuth } from './AuthProvider'

export default function AuthStatus() {
  const { status, user, signOut } = useAuth()
  const [pending, setPending] = useState(false)

  const handleSignOut = async () => {
    if (pending) return
    setPending(true)
    try {
      await signOut()
    } finally {
      setPending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0b1026]/80 px-3 py-2 text-xs text-brand-mist/70">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-magnolia" />
        Checking session…
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#101737] px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-brand-magnolia/60 hover:text-brand-magnolia"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </Link>
    )
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1026]/80 px-3 py-2 text-xs text-white">
      <span className="flex items-center gap-1 text-brand-mist/80">
        <UserCircle2 className="h-4 w-4 text-brand-magnolia" />
        {user.email}
      </span>
      <span className="hidden items-center gap-1 rounded-full bg-brand-magnolia/10 px-2 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-magnolia sm:inline-flex">
        <ShieldCheck className="h-3 w-3" /> Active session
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#161f3e] px-2.5 py-1 text-[0.7rem] font-semibold transition hover:border-brand-magnolia/60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
        Sign out
      </button>
    </div>
  )
}
