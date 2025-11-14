'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, LogIn, LogOut, ShieldCheck, UserPlus } from 'lucide-react'

import { useAuth } from '@/components/auth/AuthProvider'

export default function AuthControls() {
  const { status, user, signOut } = useAuth()
  const [pending, setPending] = useState(false)

  const accountLabel = useMemo(() => {
    if (!user) return null
    const username = user.user_metadata?.username
    if (typeof username === 'string' && username.trim().length > 0) {
      return username.trim()
    }
    return user.email ?? 'Account'
  }, [user])

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
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-brand-mist/70">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking access…
      </span>
    )
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/profile" className="button-secondary whitespace-nowrap">
          <ShieldCheck className="h-4 w-4" />
          {accountLabel}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="button-ghost border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-white/30"
          disabled={pending}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/auth?intent=signin" className="button-primary whitespace-nowrap">
        <LogIn className="h-4 w-4" />
        Sign in
      </Link>
      <Link href="/auth?intent=signup" className="button-tertiary whitespace-nowrap">
        <UserPlus className="h-4 w-4" />
        Sign up
      </Link>
    </div>
  )
}
