'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import CharacterAvatar from './CharacterAvatar'
import { useAuth } from './auth/AuthProvider'
import { useMoaStore } from '@/lib/store'
import { getProfile, type MiraiProfile } from '@/lib/supabaseApi'
import { reportError } from '@/lib/observability'
import { resolveAvatarImage } from '@/lib/avatar'

function formatStageLabel(stage: string | null | undefined): string {
  if (!stage) {
    return 'Concept incubation'
  }

  return stage
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function computeAverage(values: number[]): number {
  if (!values.length) {
    return 0
  }
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

export default function MarketplaceAvatarPreview() {
  const { user, designProfile } = useAuth()
  const mood = useMoaStore((state) => state.mood)
  const personality = useMoaStore((state) => state.personality)
  const [profile, setProfile] = useState<MiraiProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const userId = user?.id
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return () => {
        active = false
      }
    }

    setLoading(true)
    getProfile(userId)
      .then((record) => {
        if (!active) return
        setProfile(record)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        reportError('MarketplaceAvatarPreview.getProfile', error, { userId })
        setProfile(null)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  const accentColor = profile?.color || designProfile?.design_dna?.palette?.vibrant || '#7F5BFF'

  const avatarImage = useMemo(() => resolveAvatarImage(profile?.avatar, accentColor), [profile?.avatar, accentColor])

  const displayName = useMemo(() => {
    if (profile?.name) return profile.name
    const metadata = (user?.user_metadata as { username?: string; full_name?: string } | null) || null
    return metadata?.full_name || metadata?.username || user?.email?.split('@')[0] || 'Mirai Avatar'
  }, [profile?.name, user])

  const preferredEmotion = designProfile?.preferred_emotion || mood || 'neutral'
  const stageLabel = formatStageLabel(designProfile?.evolution_stage || null)

  const energy = Math.min(0.95, Math.max(0.25, personality.energy ?? 0.6))
  const connectionScore = computeAverage([
    personality.empathy ?? 0.6,
    personality.creativity ?? 0.6,
    personality.confidence ?? 0.6,
  ])

  const mintedId = useMemo(() => {
    if (profile?.id) return profile.id.toUpperCase()
    if (user?.id) return `USER-${user.id.slice(0, 6).toUpperCase()}`
    return 'OFFLINE-SEED'
  }, [profile?.id, user?.id])

  const statCopy = useMemo(
    () => [
      { key: 'empathy', label: 'Empathy', value: personality.empathy ?? 0 },
      { key: 'creativity', label: 'Creativity', value: personality.creativity ?? 0 },
      { key: 'confidence', label: 'Confidence', value: personality.confidence ?? 0 },
      { key: 'curiosity', label: 'Curiosity', value: personality.curiosity ?? 0 },
      { key: 'energy', label: 'Energy', value: personality.energy ?? 0 },
    ],
    [personality],
  )

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1430]/80 p-8 shadow-[0_35px_85px_rgba(6,10,30,0.65)] backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-magnolia/10 via-transparent to-brand-mint/10" />
      <div className="absolute -top-32 right-[-15%] h-72 w-72 rounded-full bg-brand-magnolia/25 blur-3xl" />
      <div className="absolute -bottom-28 left-[-20%] h-64 w-64 rounded-full bg-brand-mint/20 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-col gap-6 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.48em] text-brand-mist/70">
            <Sparkles className="h-3 w-3" />
            Avatar Mint Preview
          </span>
          <div>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{displayName}&apos;s Resonance Card</h2>
            <p className="mt-3 max-w-xl text-sm text-brand-mist/75">
              This holographic mockup renders your avatar as if it were minted today. Plug it into your backend mint flow to issue the
              full collectible once the contracts deploy.
            </p>
          </div>

          <div className="grid gap-4 text-xs uppercase tracking-[0.36em] text-brand-mist/65 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="opacity-70">Evolution Stage</div>
              <div className="mt-2 text-sm font-semibold text-white">{stageLabel}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="opacity-70">Preferred Emotion</div>
              <div className="mt-2 text-sm font-semibold text-white">{preferredEmotion}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {statCopy.map((stat) => {
              const percent = Math.round(Math.min(1, Math.max(0, stat.value)) * 100)
              return (
                <div key={stat.key} className="space-y-2">
                  <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/65">
                    <span>{stat.label}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${accentColor}, rgba(255,255,255,0.2))` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute -inset-4 rounded-[36px] border border-brand-magnolia/20 bg-brand-mint/10 blur-xl" />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-5 rounded-[32px] border border-white/10 bg-[#0b1028]/80 p-6 shadow-[0_30px_70px_rgba(6,10,30,0.6)]">
            <div className="flex w-full items-center justify-between text-[0.6rem] uppercase tracking-[0.42em] text-brand-mist/70">
              <span>{mintedId}</span>
              <span>{loading ? 'Calibrating…' : 'Prototype Ready'}</span>
            </div>
            <CharacterAvatar
              color={accentColor}
              intensity={energy}
              entityImageUrl={avatarImage}
              connectionScore={connectionScore}
              prompt={`Emotional anchor: ${preferredEmotion}`}
              bonded={connectionScore >= 0.65}
            />
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/70">
              Mood Sync • {preferredEmotion}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
