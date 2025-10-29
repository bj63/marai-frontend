'use client'

import { useState } from 'react'
import { Loader2, UserCheck, UserPlus } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { followProfile, unfollowProfile } from '@/lib/supabaseApi'

interface FollowButtonProps {
  targetId: string
  initiallyFollowing: boolean
  onToggle?: (state: boolean) => void
}

export default function FollowButton({ targetId, initiallyFollowing, onToggle }: FollowButtonProps) {
  const { user, status } = useAuth()
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing)
  const [loading, setLoading] = useState(false)

  if (!user || user.id === targetId) {
    return null
  }

  const handleToggle = async () => {
    if (!user || status !== 'authenticated') {
      return
    }

    setLoading(true)
    const nextState = !isFollowing
    const result = nextState ? await followProfile(user.id, targetId) : await unfollowProfile(user.id, targetId)
    if (!result.error) {
      setIsFollowing(nextState)
      onToggle?.(nextState)
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] transition ${
        isFollowing
          ? 'border-brand-magnolia/50 bg-brand-magnolia/10 text-brand-magnolia'
          : 'border-white/15 bg-transparent text-brand-mist hover:border-brand-magnolia/40 hover:text-brand-magnolia'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
