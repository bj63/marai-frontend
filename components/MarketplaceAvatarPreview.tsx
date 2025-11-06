'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, Sparkles, Wand2 } from 'lucide-react'

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
  const seededFor = useRef<string | null>(null)

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
  const designTagline = designProfile?.design_dna?.tagline || 'Adaptive co-pilot tuned to your emotional telemetry'

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

  const initialLikeEstimate = useMemo(() => {
    const empathy = Math.round((personality.empathy ?? 0.5) * 160)
    const creativity = Math.round((personality.creativity ?? 0.5) * 140)
    return 420 + empathy + Math.floor(creativity / 2)
  }, [personality.creativity, personality.empathy])

  const [likes, setLikes] = useState(initialLikeEstimate)
  const [liked, setLiked] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [newComment, setNewComment] = useState('')

  const seededComments = useMemo(
    () => [
      {
        id: `${mintedId}-studio`,
        author: 'Studio Feed',
        message: `Moodboard locked to “${preferredEmotion}” to mirror your live sessions.`,
        tone: 'ai-personalisation',
      },
      {
        id: `${mintedId}-collective`,
        author: 'Collector Collective',
        message: `Projection aura boosted to ${Math.round(connectionScore * 100)}% for your fan share preview.`,
        tone: 'community-signal',
      },
    ],
    [connectionScore, mintedId, preferredEmotion],
  )

  const commentSeedKey = `${mintedId}|${preferredEmotion}|${stageLabel}`

  const [comments, setComments] = useState(() => seededComments)

  useEffect(() => {
    if (seededFor.current === commentSeedKey) {
      return
    }
    seededFor.current = commentSeedKey
    setComments(seededComments)
    setLikes(initialLikeEstimate)
    setLiked(false)
  }, [commentSeedKey, initialLikeEstimate, seededComments])

  const toggleLike = () => {
    setLiked((next) => {
      const nextValue = !next
      setLikes((count) => count + (nextValue ? 1 : -1))
      return nextValue
    })
  }

  const handleShare = async () => {
    const payload = `${displayName} – ${stageLabel} | ${preferredEmotion}\n${designTagline}`
    try {
      await navigator?.clipboard?.writeText(payload)
      setShareStatus('copied')
    } catch (error) {
      setShareStatus('error')
    }
    setTimeout(() => setShareStatus('idle'), 2400)
  }

  const handleCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newComment.trim()
    if (!trimmed) return

    setComments((existing) => [
      {
        id: `${mintedId}-${Date.now()}`,
        author: displayName,
        message: trimmed,
        tone: 'creator-note',
      },
      ...existing,
    ])
    setNewComment('')
  }

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
                  <div className="group relative flex items-center justify-between text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/65">
                    <span>{stat.label}</span>
                    <span>{percent}%</span>
                    <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-52 rounded-xl border border-white/15 bg-[#0b1129]/95 px-3 py-2 text-[0.55rem] uppercase tracking-[0.32em] text-brand-mist/80 opacity-0 shadow-[0_15px_40px_rgba(5,8,24,0.55)] transition duration-200 group-hover:opacity-100">
                      {stat.label} tuned by Moa&apos;s adaptive personality engine
                    </div>
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
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[0.65rem] uppercase tracking-[0.38em] text-brand-mist/70">
              <div className="flex items-center gap-2 text-white/80">
                <Wand2 className="h-4 w-4" />
                AI Personalisation Brief
              </div>
              <p className="mt-2 text-left text-[0.75rem] leading-relaxed normal-case text-white/80">
                {designTagline}
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/70">
              Mood Sync • {preferredEmotion}
            </div>
            <div className="w-full space-y-4 rounded-2xl border border-white/10 bg-[#0d142f]/80 p-4 text-brand-mist/75">
              <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.42em]">
                <span>Fan Signals</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-white/75 transition hover:border-white/40 hover:bg-white/10"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.6rem] uppercase tracking-[0.32em] text-white/80">
                <button
                  type="button"
                  onClick={toggleLike}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                  aria-pressed={liked}
                >
                  <Heart className={`h-4 w-4 transition ${liked ? 'fill-current text-brand-magnolia' : ''}`} />
                  {likes}
                </button>
                <div className="flex items-center gap-2 text-white/75">
                  <MessageCircle className="h-4 w-4" />
                  {comments.length}
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Wand2 className="h-4 w-4" />
                  {shareStatus === 'copied'
                    ? 'Copied preview'
                    : shareStatus === 'error'
                    ? 'Share unavailable'
                    : 'AI persona ready'}
                </div>
              </div>

              <form className="space-y-3" onSubmit={handleCommentSubmit}>
                <label className="block text-[0.55rem] uppercase tracking-[0.42em] text-brand-mist/70" htmlFor="marketplace-comment">
                  Add A Reaction
                </label>
                <textarea
                  id="marketplace-comment"
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Drop a note for your crew…"
                  className="h-20 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[0.75rem] text-white/80 outline-none transition focus:border-brand-magnolia/60 focus:ring-2 focus:ring-brand-magnolia/30"
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-magnolia/60 bg-brand-magnolia/10 px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-brand-magnolia transition hover:bg-brand-magnolia/20"
                >
                  <Sparkles className="h-3 w-3" />
                  Post reaction
                </button>
              </form>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-[0.75rem] text-white/85"
                    >
                      <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.42em] text-brand-mist/70">
                        <span>{comment.author}</span>
                        <span>{comment.tone.replace(/-/g, ' ')}</span>
                      </div>
                      <p className="mt-2 leading-relaxed text-white/90">{comment.message}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
