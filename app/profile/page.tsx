'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Copy, Loader2, Save } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMoaStore, type Personality as StorePersonality } from '@/lib/store'
import {
  getFeedForUser,
  getFollowers,
  getPersonality,
  getProfile,
  getFollowing,
  savePersonality,
  saveProfile,
  updateUserMetadata,
  type FeedPostWithEngagement,
  type FollowProfile,
  type MiraiProfile,
  type Personality as DbPersonality,
} from '@/lib/supabaseApi'
import MoodCard from '@/components/MoodCard'
import FollowButton from '@/components/profile/FollowButton'

type TraitKey = keyof StorePersonality

interface ProfileFormState {
  name: string
  avatar: string
  color: string
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null

const emojiOptions = ['🐱', '🐰', '🐻', '🐉', '🦊', '🐧', '🐼']

const defaultTraits: StorePersonality = {
  empathy: 0.75,
  creativity: 0.65,
  confidence: 0.8,
  curiosity: 0.7,
  humor: 0.6,
  energy: 0.7,
}

const traitCopy: Record<TraitKey, { label: string; helper: string }> = {
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

const clamp = (value: number) => Math.min(1, Math.max(0, value))

function mapPersonality(record: DbPersonality | null): StorePersonality {
  if (!record) return { ...defaultTraits }

  return {
    empathy: clamp(record.empathy ?? defaultTraits.empathy),
    creativity: clamp(record.creativity ?? defaultTraits.creativity),
    confidence: clamp(record.confidence ?? defaultTraits.confidence),
    curiosity: clamp(record.curiosity ?? defaultTraits.curiosity),
    humor: clamp(record.humor ?? defaultTraits.humor),
    energy: clamp(record.energy ?? defaultTraits.energy),
  }
}

function deriveProfileForm(
  profile: MiraiProfile | null,
  fallbackName: string,
): ProfileFormState {
  return {
    name: profile?.name ?? fallbackName,
    avatar: profile?.avatar ?? emojiOptions[0],
    color: profile?.color ?? '#6366F1',
  }
}

export default function ProfilePage() {
  const { status, user } = useAuth()
  const federationId = useMoaStore((state) => state.federationId)
  const storePersonality = useMoaStore((state) => state.personality)
  const setStorePersonality = useMoaStore((state) => state.setPersonality)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'followers' | 'following'>('about')
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => ({
    name: '',
    avatar: emojiOptions[0],
    color: '#6366F1',
  }))
  const [traits, setTraits] = useState<StorePersonality>(() => ({
    ...defaultTraits,
    ...storePersonality,
  }))
  const [profileFeed, setProfileFeed] = useState<FeedPostWithEngagement[]>([])
  const [followers, setFollowers] = useState<FollowProfile[]>([])
  const [following, setFollowing] = useState<FollowProfile[]>([])
  const [connectionsLoading, setConnectionsLoading] = useState(true)

  const founderNameFallback = useMemo(() => {
    if (!user) return ''
    const metadata = user.user_metadata as { username?: string; full_name?: string } | null
    return metadata?.username || metadata?.full_name || user.email?.split('@')[0] || ''
  }, [user])

  const tabs = useMemo(
    () => [
      { id: 'about' as const, label: 'About' },
      { id: 'posts' as const, label: `Posts (${profileFeed.length})` },
      { id: 'followers' as const, label: `Followers (${followers.length})` },
      { id: 'following' as const, label: `Following (${following.length})` },
    ],
    [followers.length, following.length, profileFeed.length],
  )

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) {
      setLoading(false)
      return
    }

    let active = true

    const hydrateProfile = async () => {
      setLoading(true)
      setFeedback(null)

      const [profileRecord, personalityRecord] = await Promise.all([
        getProfile(user.id),
        getPersonality(user.id),
      ])

      if (!active) return

      const nextTraits = mapPersonality(personalityRecord)
      setTraits(nextTraits)
      setStorePersonality(nextTraits)

      const formState = deriveProfileForm(profileRecord, founderNameFallback)
      setProfileForm(formState)
      setLoading(false)
    }

    hydrateProfile()

    return () => {
      active = false
    }
  }, [founderNameFallback, setStorePersonality, status, user?.id])

  useEffect(() => {
    setTraits({
      ...defaultTraits,
      ...storePersonality,
    })
  }, [storePersonality])

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) {
      setProfileFeed([])
      setFollowers([])
      setFollowing([])
      setConnectionsLoading(false)
      return
    }

    let active = true

    const loadConnections = async () => {
      setConnectionsLoading(true)
      const [feedRecords, followerRecords, followingRecords] = await Promise.all([
        getFeedForUser(user.id, user.id),
        getFollowers(user.id),
        getFollowing(user.id),
      ])

      if (!active) return

      setProfileFeed(
        (feedRecords ?? []).map((record) => ({
          ...record,
          likes_count: record.likes_count ?? 0,
          comments: record.comments ?? [],
          viewer_has_liked: Boolean(record.viewer_has_liked),
        })),
      )
      setFollowers(followerRecords ?? [])
      setFollowing(followingRecords ?? [])
      setConnectionsLoading(false)
    }

    loadConnections()

    return () => {
      active = false
    }
  }, [status, user?.id])

  const handleCopyFederationId = async () => {
    if (!federationId) return

    try {
      await navigator.clipboard.writeText(federationId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('Failed to copy federation identifier', error)
    }
  }

  const updateTrait = (trait: TraitKey, value: number) => {
    const clamped = clamp(value)
    const next = {
      ...traits,
      [trait]: clamped,
    }
    setTraits(next)
    setStorePersonality(next)
  }

  const updateFollowState = (memberId: string, nextState: boolean) => {
    const source =
      followers.find((member) => member.user_id === memberId) ||
      following.find((member) => member.user_id === memberId) ||
      null

    setFollowers((previous) =>
      previous.map((member) =>
        member.user_id === memberId
          ? {
              ...member,
              is_following: nextState,
            }
          : member,
      ),
    )

    setFollowing((previous) => {
      const exists = previous.some((member) => member.user_id === memberId)
      if (nextState) {
        if (exists) {
          return previous.map((member) =>
            member.user_id === memberId
              ? {
                  ...member,
                  is_following: nextState,
                }
              : member,
          )
        }
        return source ? [...previous, { ...source, is_following: nextState }] : previous
      }
      return previous.filter((member) => member.user_id !== memberId)
    })
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    setFeedback(null)

    const profilePayload = {
      name: profileForm.name.trim(),
      avatar: profileForm.avatar,
      color: profileForm.color,
    }

    const metadataPayload = {
      username: profilePayload.name,
      avatar_emoji: profilePayload.avatar,
      accent_color: profilePayload.color,
    }

    const [profileResult, personalityResult, metadataResult] = await Promise.all([
      saveProfile(user.id, profilePayload),
      savePersonality(user.id, traits),
      updateUserMetadata(metadataPayload),
    ])

    if (profileResult.error || personalityResult.error || metadataResult.error) {
      setFeedback({
        type: 'error',
        message:
          'We could not save your profile just yet. Try again or confirm your Supabase row-level security rules allow updates.',
      })
      setSaving(false)
      return
    }

    setFeedback({
      type: 'success',
      message: 'Profile updated! Your Mirai identity will stay in sync across every login.',
    })
    setSaving(false)
  }

  if (status === 'loading') {
    return (
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-20 text-brand-mist/70">
        <Loader2 className="h-6 w-6 animate-spin text-brand-magnolia" />
        Checking your session…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-20 text-brand-mist/70">
        <header className="flex flex-col gap-2 text-white">
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">Profile</p>
          <h1 className="text-3xl font-semibold">Sign in to manage your Mirai identity</h1>
        </header>
        <p className="text-sm">
          Use the authentication hub to sign in with email, Google, magic links, or a wallet. Once you&apos;re authenticated you
          can personalise your Mirai presence and sync it for the rest of the organisation.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-4 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia md:self-start"
        >
          Head to account access
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-20 text-brand-mist/70">
        <Loader2 className="h-6 w-6 animate-spin text-brand-magnolia" />
        Loading your profile…
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 text-brand-mist/80">
      <header className="flex flex-col gap-2 text-white">
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/60">Profile</p>
        <h1 className="text-3xl font-semibold">Shape your Mirai presence</h1>
        <p className="max-w-2xl text-sm text-brand-mist/70">
          Update account details, share your federation identifier with teammates, and tune Mirai&apos;s behaviour so every login
          feels consistent.
        </p>
      </header>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-brand-magnolia/50 bg-brand-magnolia/10 text-brand-magnolia'
              : 'border-red-400/40 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-brand-mist/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 transition ${
                isActive
                  ? 'bg-brand-magnolia/20 text-brand-magnolia shadow-[0_0_16px_rgba(255,158,207,0.25)]'
                  : 'bg-[#111834] text-brand-mist/50 hover:text-brand-magnolia'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'about' ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#0d142c]/70 p-6">
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/60">Account owner</span>
                <span className="text-base font-semibold text-white">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/60">Federation identifier</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all rounded-md bg-[#141d3c] px-2 py-1 font-mono text-xs text-brand-mist/80">
                    {federationId || 'Generating…'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFederationId}
                    disabled={!federationId}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[0.7rem] uppercase tracking-[0.3em] text-brand-mist transition hover:border-brand-magnolia/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-mist/70">Display name</span>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Founder name or project alias"
                  className="w-full rounded-md border border-white/10 bg-[#121b3a] px-3 py-2 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia/60 focus:outline-none"
                />
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-brand-mist/70">Choose avatar</span>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        setProfileForm((previous) => ({
                          ...previous,
                          avatar: emoji,
                        }))
                      }
                      className={`text-2xl transition ${
                        profileForm.avatar === emoji
                          ? 'rounded-lg border border-brand-magnolia/60 bg-brand-magnolia/10'
                          : 'rounded-lg border border-transparent bg-[#141d3c] hover:border-brand-magnolia/40'
                      } px-3 py-2`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-brand-mist/70">Accent colour</span>
                <input
                  type="color"
                  value={profileForm.color}
                  onChange={(event) =>
                    setProfileForm((previous) => ({
                      ...previous,
                      color: event.target.value,
                    }))
                  }
                  className="h-12 w-full cursor-pointer rounded-md border border-white/10 bg-[#121b3a]"
                />
              </label>
            </section>

            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Tune Mirai&apos;s behaviour</h2>
                <p className="text-xs text-brand-mist/70">Drag the sliders to personalise how your Mirai co-pilot shows up.</p>
              </div>
              <div className="flex flex-col gap-4">
                {(Object.keys(traitCopy) as TraitKey[]).map((trait) => (
                  <div key={trait} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm text-brand-mist/70">
                      <span className="font-medium text-white">{traitCopy[trait].label}</span>
                      <span>{Math.round((traits[trait] || 0) * 100)}%</span>
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
            </section>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-magnolia/80 px-4 py-2 text-sm font-semibold text-[#0b1022] transition hover:bg-brand-magnolia disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>

          <motion.div
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-brand-mist"
            style={{ borderTop: `4px solid ${profileForm.color}` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-5xl">{profileForm.avatar}</div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-white">{profileForm.name || founderNameFallback || 'Your Mirai'}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/60">Preview</span>
            </div>
            <div className="rounded-xl bg-[#121b3a]/70 p-4 text-left text-sm text-brand-mist/80">
              <p className="text-brand-mist/60">Session signature</p>
              <ul className="mt-2 space-y-1 text-xs">
                {(Object.keys(traitCopy) as TraitKey[]).map((trait) => (
                  <li key={trait} className="flex justify-between">
                    <span>{traitCopy[trait].label}</span>
                    <span className="font-mono">{Math.round((traits[trait] || 0) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-brand-mist/70">
              These settings sync with Supabase, so every teammate sees the same personality and branding when they log in.
            </p>
          </motion.div>
        </div>
      ) : null}

      {activeTab === 'posts' ? (
        <section className="rounded-2xl border border-white/10 bg-[#101737]/60 p-6">
          <header className="mb-4 flex items-center justify-between text-sm text-brand-mist/70">
            <h2 className="text-lg font-semibold text-white">Feed contributions</h2>
            {connectionsLoading ? <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" /> : null}
          </header>
          {connectionsLoading ? (
            <p className="text-sm text-brand-mist/60">Loading your posts…</p>
          ) : profileFeed.length === 0 ? (
            <p className="text-sm text-brand-mist/60">No posts yet — share how Moa feels from the feed composer.</p>
          ) : (
            <div className="space-y-4">
              {profileFeed.map((post) => (
                <div key={post.id} className="rounded-xl border border-white/10 bg-[#0d142c]/70 p-4">
                  <MoodCard post={post} />
                  <div className="mt-3 flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.3em] text-brand-mist/50">
                    <span>{post.likes_count} empathy</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === 'followers' ? (
        <section className="rounded-2xl border border-white/10 bg-[#101737]/60 p-6 text-sm text-brand-mist/80">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Followers</h2>
            {connectionsLoading ? <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" /> : null}
          </header>
          {connectionsLoading ? (
            <p className="text-sm text-brand-mist/60">Checking who&apos;s tuned in…</p>
          ) : followers.length === 0 ? (
            <p className="text-sm text-brand-mist/60">No followers just yet. Invite collaborators from the admin hub.</p>
          ) : (
            <div className="space-y-3">
              {followers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121b3a]/70 p-4"
                >
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-white">{member.name || 'Federation member'}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/50">{member.handle || member.user_id}</span>
                    {member.bio ? <p className="mt-1 text-sm text-brand-mist/70">{member.bio}</p> : null}
                  </div>
                  <FollowButton
                    targetId={member.user_id}
                    initiallyFollowing={Boolean(member.is_following)}
                    onToggle={(state) => updateFollowState(member.user_id, state)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === 'following' ? (
        <section className="rounded-2xl border border-white/10 bg-[#101737]/60 p-6 text-sm text-brand-mist/80">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Following</h2>
            {connectionsLoading ? <Loader2 className="h-4 w-4 animate-spin text-brand-magnolia" /> : null}
          </header>
          {connectionsLoading ? (
            <p className="text-sm text-brand-mist/60">Loading your connections…</p>
          ) : following.length === 0 ? (
            <p className="text-sm text-brand-mist/60">You&apos;re not following anyone yet. Discover new teams from the explore page.</p>
          ) : (
            <div className="space-y-3">
              {following.map((member) => (
                <div
                  key={member.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121b3a]/70 p-4"
                >
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-white">{member.name || 'Federation member'}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-brand-mist/50">{member.handle || member.user_id}</span>
                    {member.bio ? <p className="mt-1 text-sm text-brand-mist/70">{member.bio}</p> : null}
                  </div>
                  <FollowButton
                    targetId={member.user_id}
                    initiallyFollowing
                    onToggle={(state) => updateFollowState(member.user_id, state)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
