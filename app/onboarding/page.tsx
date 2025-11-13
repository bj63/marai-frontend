'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMoaStore, type Personality as StorePersonality } from '@/lib/store'
import {
  getOnboardingState,
  getProfile,
  savePersonality,
  saveProfile,
  upsertOnboardingState,
  updateUserMetadata,
} from '@/lib/supabaseApi'

const emojiOptions = ['🐱', '🐰', '🐉', '🦊', '🦋', '🐚']

const defaultTraits: StorePersonality = {
  empathy: 0.75,
  creativity: 0.65,
  confidence: 0.8,
  curiosity: 0.7,
  humor: 0.6,
  energy: 0.7,
}

const traitCopy: Record<keyof StorePersonality, { label: string; helper: string }> = {
  empathy: {
    label: 'Empathy',
    helper: 'How present and emotionally aware your Mirai feels during sessions.',
  },
  creativity: {
    label: 'Creativity',
    helper: 'The experimental spark that drives generative leaps and sonic improvisation.',
  },
  confidence: {
    label: 'Confidence',
    helper: 'Controls how boldly Mirai presents ideas versus seeking extra validation.',
  },
  curiosity: {
    label: 'Curiosity',
    helper: 'Determines how many follow-up questions or alternate takes appear.',
  },
  humor: {
    label: 'Humor',
    helper: 'Adds levity, wit, and easter eggs throughout the experience.',
  },
  energy: {
    label: 'Energy',
    helper: 'Balances chill reflection against hype-lifting momentum.',
  },
}

const steps = [
  {
    id: 'identity',
    title: 'Claim your identity',
    description: 'Choose a name, handle, and avatar your team will recognise.',
  },
  {
    id: 'persona',
    title: "Tune Mirai's persona",
    description: "Dial in traits so Amaris mirrors your studio's vibe.",
  },
  {
    id: 'connections',
    title: 'Connect collaboration surfaces',
    description: 'Decide how updates, notifications, and sharing should behave.',
  },
]

type OnboardingForm = {
  name: string
  handle: string
  bio: string
  avatar: string
  color: string
  shareActivity: boolean
}

type Feedback = { type: 'success' | 'error'; message: string } | null

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

export default function OnboardingPage() {
  const { status, user } = useAuth()
  const router = useRouter()
  const storePersonality = useMoaStore((state) => state.personality)
  const setStorePersonality = useMoaStore((state) => state.setPersonality)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [form, setForm] = useState<OnboardingForm>({
    name: '',
    handle: '',
    bio: '',
    avatar: emojiOptions[0],
    color: '#6366F1',
    shareActivity: true,
  })
  const [traits, setTraits] = useState<StorePersonality>({ ...defaultTraits })

  const currentStep = steps[stepIndex]
  const hasPrevious = stepIndex > 0
  const hasNext = stepIndex < steps.length - 1

  const founderNameFallback = useMemo(() => {
    if (!user) return ''
    const metadata = user.user_metadata as { username?: string; full_name?: string } | null
    return metadata?.username || metadata?.full_name || user.email?.split('@')[0] || ''
  }, [user])

  useEffect(() => {
    if (status === 'loading') return
    if (!user) {
      setLoading(false)
      return
    }

    let active = true

    const hydrate = async () => {
      setLoading(true)
      const [profileRecord, onboarding] = await Promise.all([
        getProfile(user.id),
        getOnboardingState(user.id),
      ])

      if (!active) return

      if (profileRecord) {
        setForm((previous) => ({
          ...previous,
          name: profileRecord.name || founderNameFallback,
          avatar: profileRecord.avatar || previous.avatar,
          color: profileRecord.color || previous.color,
          handle: profileRecord.handle ? profileRecord.handle.replace(/^@+/, '@') : previous.handle,
          bio: profileRecord.bio ?? previous.bio,
        }))
      } else {
        setForm((previous) => ({
          ...previous,
          name: founderNameFallback,
        }))
      }

      if (onboarding?.completed) {
        router.replace('/')
        return
      }

      if (storePersonality) {
        setTraits({ ...defaultTraits, ...storePersonality })
      }

      setLoading(false)
    }

    hydrate()

    return () => {
      active = false
    }
  }, [founderNameFallback, router, status, storePersonality, user])

  useEffect(() => {
    setTraits((previous) => ({
      ...previous,
      ...storePersonality,
    }))
  }, [storePersonality])

  const updateTrait = (trait: keyof StorePersonality, value: number) => {
    const clamped = clamp(value)
    const next = { ...traits, [trait]: clamped }
    setTraits(next)
    setStorePersonality(next)
  }

  const handleNext = async () => {
    if (!user) return

    if (hasNext) {
      setStepIndex((index) => index + 1)
      await upsertOnboardingState(user.id, {
        user_id: user.id,
        completed: false,
        current_step: steps[stepIndex + 1]?.id ?? currentStep.id,
      })
    }
  }

  const handleBack = () => {
    if (!hasPrevious) return
    setStepIndex((index) => index - 1)
  }

  const handleComplete = async () => {
    if (!user) return
    setSaving(true)
    setFeedback(null)

    const normalizedHandle = form.handle.trim()
    const handleValue = normalizedHandle
      ? normalizedHandle.startsWith('@')
        ? normalizedHandle
        : `@${normalizedHandle}`
      : null

    const profilePayload = {
      name: form.name.trim() || founderNameFallback,
      avatar: form.avatar,
      color: form.color,
      handle: handleValue,
      bio: form.bio.trim() || null,
    }

    const metadataPayload = {
      username: handleValue ?? form.name,
      bio: form.bio,
      accent_color: form.color,
      avatar_emoji: form.avatar,
      share_activity: form.shareActivity,
    }

    const [profileResult, personalityResult, onboardingResult, metadataResult] = await Promise.all([
      saveProfile(user.id, profilePayload),
      savePersonality(user.id, traits),
      upsertOnboardingState(user.id, {
        completed: true,
        current_step: 'complete',
        completed_at: new Date().toISOString(),
      }),
      updateUserMetadata(metadataPayload),
    ])

    if (profileResult.error || personalityResult.error || onboardingResult.error || metadataResult.error) {
      setFeedback({
        type: 'error',
        message: 'We could not save everything yet. Double-check Supabase policies and try again.',
      })
      setSaving(false)
      return
    }

    setFeedback({
      type: 'success',
      message: 'Onboarding locked in! Redirecting you to the feed…',
    })
    setSaving(false)
    setTimeout(() => router.replace('/feed'), 1200)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-brand-mist/70">
        <Loader2 className="h-6 w-6 animate-spin text-brand-magnolia" />
        Preparing your onboarding…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-4 text-center text-brand-mist/80">
        <h1 className="text-2xl font-semibold text-white">Create an account to continue</h1>
        <p className="text-sm text-brand-mist/70">
          Head to the authentication hub to log in or sign up. Once you&rsquo;re authenticated we&rsquo;ll walk you through setting up your Mirai identity.
        </p>
      </div>
    )
  }

  return (
    <div className="page-shell" data-width="narrow">
      <header className="section-header text-white">
        <p className="section-label text-brand-mist/60">Onboarding</p>
        <h1 className="section-title text-3xl">Launch your Mirai presence</h1>
        <p className="section-description text-brand-mist/70">
          Follow the guided steps so your feed, chat, and team orchestration mirror production state.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-brand-mist/60">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={`rounded-full px-3 py-1 ${
              index === stepIndex
                ? 'bg-brand-magnolia/20 text-brand-magnolia'
                : index < stepIndex
                ? 'bg-brand-cypress/20 text-brand-cypress'
                : 'bg-[#101737] text-brand-mist/50'
            }`}
          >
            {step.title}
          </span>
        ))}
      </div>

      {feedback ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-brand-magnolia/40 bg-brand-magnolia/10 text-brand-magnolia'
              : 'border-red-500/40 bg-red-500/10 text-red-200'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {feedback.message}
        </div>
      ) : null}

      <motion.section
        key={currentStep.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-[#101737]/70 p-6 shadow-2xl"
      >
        <header className="mb-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white">{currentStep.title}</h2>
          <p className="text-sm text-brand-mist/70">{currentStep.description}</p>
        </header>

        {currentStep.id === 'identity' ? (
          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-mist/60">Display name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Founder name or studio alias"
                  className="w-full rounded-md border border-white/10 bg-[#121b3a] px-3 py-2 text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/60 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-mist/60">Handle</span>
                <input
                  type="text"
                  value={form.handle}
                  onChange={(event) => setForm((previous) => ({ ...previous, handle: event.target.value }))}
                  placeholder="@amaris-founders"
                  className="w-full rounded-md border border-white/10 bg-[#121b3a] px-3 py-2 text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/60 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-mist/60">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((previous) => ({ ...previous, bio: event.target.value }))}
                  rows={4}
                  placeholder="What does your crew need to know about collaborating with your Mirai?"
                  className="w-full rounded-md border border-white/10 bg-[#121b3a] px-3 py-2 text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/60 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-brand-mist/60">Choose avatar</span>
              <div className="grid grid-cols-3 gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm((previous) => ({ ...previous, avatar: emoji }))}
                    className={`flex items-center justify-center rounded-xl border px-3 py-4 text-3xl transition ${
                      form.avatar === emoji
                        ? 'border-brand-magnolia/70 bg-brand-magnolia/10'
                        : 'border-white/10 bg-[#141d3c] hover:border-brand-magnolia/40'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-mist/60">Accent colour</span>
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) => setForm((previous) => ({ ...previous, color: event.target.value }))}
                  className="h-14 w-full cursor-pointer rounded-xl border border-white/10 bg-[#141d3c]"
                />
              </label>
            </div>
          </div>
        ) : null}

        {currentStep.id === 'persona' ? (
          <div className="grid gap-6 md:grid-cols-2">
            {(Object.keys(traitCopy) as Array<keyof StorePersonality>).map((trait) => (
              <div key={trait} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#121b3a]/70 p-4">
                <div className="flex items-center justify-between text-sm text-brand-mist/70">
                  <span className="font-medium text-white">{traitCopy[trait].label}</span>
                  <span>{Math.round((traits[trait] ?? 0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={traits[trait] ?? 0}
                  onChange={(event) => updateTrait(trait, parseFloat(event.target.value))}
                  className="accent-brand-magnolia"
                />
                <p className="text-[0.7rem] text-brand-mist/60">{traitCopy[trait].helper}</p>
              </div>
            ))}
          </div>
        ) : null}

        {currentStep.id === 'connections' ? (
          <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#121b3a]/70 p-4 text-sm">
              <input
                type="checkbox"
                checked={form.shareActivity}
                onChange={(event) => setForm((previous) => ({ ...previous, shareActivity: event.target.checked }))}
                className="mt-1"
              />
              <span>
                <strong className="block text-white">Share feed updates automatically</strong>
                Let teammates know when new drops, comments, or mood pivots go live.
              </span>
            </label>
            <p className="rounded-2xl border border-brand-magnolia/30 bg-brand-magnolia/10 p-4 text-sm text-brand-magnolia">
              Once you finish onboarding we&rsquo;ll connect the notifications centre and direct messages so everyone enters with the same context.
            </p>
          </div>
        ) : null}
      </motion.section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={!hasPrevious || saving}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-mist transition hover:border-brand-magnolia/40 hover:text-brand-magnolia disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        {hasNext ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-brand-magnolia/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#0b1022] transition hover:bg-brand-magnolia"
          >
            Next <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-brand-cypress px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#06111b] transition hover:bg-brand-cypress/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Finish setup
          </button>
        )}
      </div>
    </div>
  )
}
