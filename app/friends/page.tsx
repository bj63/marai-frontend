'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ComponentProps, type ComponentType, type ReactNode } from 'react'
import {
  ArrowRight,
  Brain,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  Radar,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  createRelationalMemoryEvent,
  fetchFriendConnections,
  setFollowStatus,
  setFriendAiChat,
  setGlobalFriendAiChat,
  setInnerCircle,
  type FriendConnection,
} from '@/lib/friends/api'

type MemoryEvent = {
  id: string
  title: string
  detail: string
  tone: 'warm' | 'neutral'
}

const initialConnections: FriendConnection[] = [
  {
    id: 'ezra',
    name: 'Ezra Waveforms',
    avatar: '/avatars/ezra.png',
    tagline: 'Modular dreamscapes & tactile signal art.',
    followsYou: true,
    youFollow: true,
    theirInnerCircle: true,
    yourInnerCircle: true,
    aiChatOptIn: true,
    locationSignal: 'Same studio check-in (SoMa)',
    postingOverlap: 'Posted within 10 minutes of you twice today',
    dreamLink: 'Shares “neon tide” mood with your last dream',
    aiToAiSignal: 'Amaris traded stems with Ezra’s AI twice',
  },
  {
    id: 'lyra',
    name: 'Lyra Echo',
    avatar: '/avatars/lyra.png',
    tagline: 'Narrative AI weaving memory collages.',
    followsYou: false,
    youFollow: true,
    theirInnerCircle: false,
    yourInnerCircle: false,
    aiChatOptIn: true,
    postingOverlap: 'Late-night uploads align with yours',
    dreamLink: 'Recurring “lighthouse” motif',
  },
  {
    id: 'kai',
    name: 'Kai Drift',
    avatar: '/avatars/collective.png',
    tagline: 'Signals engineer mapping social resonance.',
    followsYou: true,
    youFollow: false,
    theirInnerCircle: false,
    yourInnerCircle: false,
    aiChatOptIn: false,
    locationSignal: 'At the same pop-up last night',
    aiToAiSignal: 'Kai’s AI bookmarked your bond chart',
  },
  {
    id: 'mina',
    name: 'Mina Sol',
    avatar: '/avatars/amaris.png',
    tagline: 'Synth-pop muse crafting mood-reactive hooks.',
    followsYou: true,
    youFollow: true,
    theirInnerCircle: false,
    yourInnerCircle: true,
    aiChatOptIn: true,
    dreamLink: 'Shared “orbit” dream loop with you',
  },
]

const discoverySignals = [
  {
    label: 'People your MarAI thinks you’ll like',
    reasons: ['Same location event', 'Similar posting window', 'Dream theme overlap'],
  },
  {
    label: 'AI-to-AI chemistry spikes',
    reasons: ['Stems exchanged', 'Mood mirrors', 'Relational memory unlocked'],
  },
]

export default function FriendsPage() {
  const [connections, setConnections] = useState<FriendConnection[]>(initialConnections)
  const [memoryEvents, setMemoryEvents] = useState<MemoryEvent[]>([
    {
      id: 'memory-1',
      title: 'Relational memory link created',
      detail: 'Ezra + you | tone: warm | delta: +0.25 | context: became friends',
      tone: 'warm',
    },
  ])
  const [notice, setNotice] = useState<string | null>(null)
  const [globalAiChatOptIn, setGlobalAiChatOptIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const friendCount = useMemo(
    () => connections.filter((connection) => connection.youFollow && connection.followsYou).length,
    [connections],
  )

  useEffect(() => {
    let isMounted = true
    const loadConnections = async () => {
      setIsLoading(true)
      try {
        const remote = await fetchFriendConnections()
        if (isMounted) {
          setConnections(remote.length > 0 ? remote : initialConnections)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Failed to load connections', error)
        setNotice('Could not load live connections; showing local fallback for now.')
        setConnections(initialConnections)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadConnections()
    return () => {
      isMounted = false
    }
  }, [])

  const innerCircleCount = useMemo(
    () =>
      connections.filter(
        (connection) => connection.youFollow && connection.followsYou && connection.yourInnerCircle && connection.theirInnerCircle,
      ).length,
    [connections],
  )

  const aiChatAccessCount = useMemo(
    () =>
      connections.filter((connection) =>
        isFriend(connection) &&
        connection.yourInnerCircle &&
        connection.theirInnerCircle &&
        connection.aiChatOptIn &&
        globalAiChatOptIn,
      ).length,
    [connections, globalAiChatOptIn],
  )

  const updateConnection = (id: string, updater: (connection: FriendConnection) => FriendConnection) => {
    setConnections((previous) => previous.map((connection) => (connection.id === id ? updater(connection) : connection)))
  }

  const pushMemory = async (
    title: string,
    detail: string,
    tone: MemoryEvent['tone'] = 'warm',
    delta = 0,
    subjectId = 'graph',
  ) => {
    const memory = { id: `memory-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, title, detail, tone }
    setMemoryEvents((previous) => [memory, ...previous])

    try {
      await createRelationalMemoryEvent({ subjectId, context: detail, tone, delta })
    } catch (error) {
      console.error('Failed to sync relational memory', error)
      setNotice('Local memory updated, but syncing to MarAI failed. Will retry later.')
    }
  }

  const toggleFollow = async (id: string) => {
    const connection = connections.find((entry) => entry.id === id)
    if (!connection) return

    const nextFollow = !connection.youFollow
    const previous = connection.youFollow
    updateConnection(id, (entry) => ({ ...entry, youFollow: nextFollow }))

    try {
      await setFollowStatus(id, nextFollow)
      if (nextFollow && connection.followsYou) {
        await pushMemory(
          'Relational memory link created',
          `${connection.name} + you | tone: warm | delta: +0.25 | context: became friends`,
          'warm',
          0.25,
          connection.id,
        )
        setNotice(`${connection.name} is now a friend. Inner Circle and AI chat controls unlocked.`)
      } else if (!nextFollow && connection.followsYou) {
        await pushMemory(
          'Friendship cooled',
          `${connection.name} + you | tone: neutral | delta: -0.25 | context: unfollowed`,
          'neutral',
          -0.25,
          connection.id,
        )
        setNotice(`${connection.name} stayed following, but friendship was removed.`)
      } else if (!nextFollow) {
        setNotice(`${connection.name} is no longer in your follow graph.`)
      } else {
        setNotice(`Following ${connection.name}. Friendship will form if they follow you back.`)
      }
    } catch (error) {
      console.error('Follow toggle failed', error)
      setNotice('Unable to update follow state. Please try again.')
      updateConnection(id, (entry) => ({ ...entry, youFollow: previous }))
    }
  }

  const toggleInnerCircle = async (id: string) => {
    const connection = connections.find((entry) => entry.id === id)
    if (!connection) return

    if (!isFriend(connection)) {
      setNotice('Inner Circle is reserved for mutual friends. Complete the follow-back to unlock it.')
      return
    }

    const nextState = !connection.yourInnerCircle
    updateConnection(id, (entry) => ({ ...entry, yourInnerCircle: nextState }))
    try {
      await setInnerCircle(id, nextState)
      await pushMemory(
        nextState ? 'Inner Circle granted' : 'Inner Circle removed',
        `${connection.name} + you | tone: warm | delta: ${nextState ? '+0.15' : '-0.15'} | context: Inner Circle ${
          nextState ? 'enabled' : 'revoked'
        }`,
        'warm',
        nextState ? 0.15 : -0.15,
        connection.id,
      )
      setNotice(`${connection.name} ${nextState ? 'entered' : 'left'} your Inner Circle.`)
    } catch (error) {
      console.error('Inner Circle toggle failed', error)
      setNotice('Unable to update Inner Circle right now.')
      updateConnection(id, (entry) => ({ ...entry, yourInnerCircle: !nextState }))
    }
  }

  const toggleAiChat = async (id: string) => {
    const connection = connections.find((entry) => entry.id === id)
    if (!connection) return

    if (!isAiChatEligible(connection, globalAiChatOptIn)) {
      setNotice('AI chat unlocks only when you are friends, both in Inner Circle, and both opted in.')
      return
    }

    const nextState = !connection.aiChatOptIn
    updateConnection(id, (entry) => ({ ...entry, aiChatOptIn: nextState }))
    try {
      await setFriendAiChat(id, nextState)
      await pushMemory(
        nextState ? 'Friend AI chat opened' : 'Friend AI chat closed',
        `${connection.name} + you | tone: warm | delta: ${nextState ? '+0.2' : '-0.2'} | context: Friend AI chat ${
          nextState ? 'on' : 'off'
        }`,
        'warm',
        nextState ? 0.2 : -0.2,
        connection.id,
      )
      setNotice(`${connection.name} ${nextState ? 'can' : 'cannot'} chat with your MarAI.`)
    } catch (error) {
      console.error('AI chat toggle failed', error)
      setNotice('Unable to update friend AI chat right now.')
      updateConnection(id, (entry) => ({ ...entry, aiChatOptIn: !nextState }))
    }
  }

  const handleGlobalAiChatChange = async (enabled: boolean) => {
    setGlobalAiChatOptIn(enabled)
    try {
      await setGlobalFriendAiChat(enabled)
    } catch (error) {
      console.error('Global AI chat toggle failed', error)
      setNotice('Unable to update global AI chat settings; reverted to previous value.')
      setGlobalAiChatOptIn(!enabled)
    }
  }

  const gatedConnections = useMemo(
    () =>
      connections.map((connection) => ({
        ...connection,
        isFriend: isFriend(connection),
        aiChatEligible: isAiChatEligible(connection, globalAiChatOptIn),
        aiChatAllowed: isAiChatAllowed(connection, globalAiChatOptIn),
      })),
    [connections, globalAiChatOptIn],
  )

  return (
    <main className="page-shell" data-width="wide">
      <header className="section-header">
        <p className="section-label">Friend system</p>
        <h1 className="section-title">Hybrid follow + friend graph with AI-aware rules</h1>
        <p className="section-description text-brand-mist/70">
          Instagram-style follows create discovery. Mutual follows auto-promote to friends. Snapchat-inspired Inner Circle
          gates private MarAI access. Facebook-grade graph logic tracks permissions while your MarAI records relational memory.
        </p>
      </header>

      {notice && (
        <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {notice}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="Follow"
          description="One-way discovery for viral reach. Anyone can follow; no approval needed."
          badge={`${connections.length} in graph`}
          icon={Sparkles}
        >
          <p className="text-sm text-brand-mist/70">Triggers suggestions, notifications, and basic feed visibility.</p>
        </InfoCard>
        <InfoCard
          title="Friend (mutual)"
          description="Forms when both sides follow. Unlocks Inner Circle and richer MarAI context."
          badge={`${friendCount} mutuals`}
          icon={HeartHandshake}
        >
          <p className="text-sm text-brand-mist/70">Each mutual follow writes a relational memory link with tone + delta.</p>
        </InfoCard>
        <InfoCard
          title="Inner Circle"
          description="Snapchat-style tier for private AI content and MarAI chat access."
          badge={`${innerCircleCount} unlocked`}
          icon={LockKeyhole}
        >
          <p className="text-sm text-brand-mist/70">Only mutual friends can be elevated. Both sides must reciprocate.</p>
        </InfoCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="Friend AI chat"
          description="Available only when friendship + dual Inner Circle + opt-in are true."
          badge={`${aiChatAccessCount} allowed`}
          icon={MessageCircleHeart}
        >
          <label className="mt-2 inline-flex items-center gap-2 text-xs text-brand-mist/70">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-brand-slate/40 bg-transparent"
              checked={globalAiChatOptIn}
              onChange={(event) => handleGlobalAiChatChange(event.target.checked)}
              aria-busy={isLoading}
            />
            Allow friends to request MarAI chats when criteria are met
          </label>
        </InfoCard>
        <InfoCard
          title="Discovery"
          description="TikTok-style mutual discovery based on context and AI signals."
          badge="Contextual"
          icon={Radar}
        >
          <ul className="mt-2 space-y-1 text-sm text-brand-mist/70">
            {discoverySignals.map((signal) => (
              <li key={signal.label} className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5" />
                <span>
                  {signal.label}
                  <span className="ml-1 text-xs text-brand-mist/60">({signal.reasons.join(' · ')})</span>
                </span>
              </li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard
          title="Graph logic"
          description="Facebook-grade checks keep permissions sane."
          badge="Enforced"
          icon={Users}
        >
          <ul className="mt-2 space-y-1 text-sm text-brand-mist/70">
            <li>Friendship is mutual follow</li>
            <li>Inner Circle requires friendship</li>
            <li>AI chat requires both Inner Circles + opt-in</li>
          </ul>
        </InfoCard>
      </section>

      <section className="surface-panel surface-panel--stacked mt-6">
        <header className="section-header mb-4">
          <p className="section-label">Connection control</p>
          <h2 className="section-title">Manage follow, friendship, Inner Circle, and MarAI chat</h2>
          <p className="section-description text-brand-mist/70">
            Each card shows what is unlocked. Buttons enforce the rules: friendships form on mutual follows, Inner Circle is gated to
            friends, and MarAI chat is permitted only when both parties choose it.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          {gatedConnections.map((connection) => (
            <article key={connection.id} className="surface-card surface-card--interactive">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/10">
                  <Image src={connection.avatar} alt={connection.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                    {connection.name}
                    <Badge label={connection.isFriend ? 'Friend' : connection.youFollow ? 'Following' : 'Follower'} tone="primary" />
                    {connection.yourInnerCircle && <Badge label="Inner Circle" tone="accent" />}
                    {connection.aiChatAllowed && <Badge label="MarAI chat" tone="glow" />}
                  </div>
                  <p className="text-sm text-brand-mist/70">{connection.tagline}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-brand-mist/60">
                    {connection.locationSignal && <SignalPill icon={LocateIcon} text={connection.locationSignal} />}
                    {connection.postingOverlap && <SignalPill icon={Clock3} text={connection.postingOverlap} />}
                    {connection.dreamLink && <SignalPill icon={Sparkles} text={connection.dreamLink} />}
                    {connection.aiToAiSignal && <SignalPill icon={Brain} text={connection.aiToAiSignal} />}
                    {connection.signals?.map((signal) => (
                      <SignalPill key={signal} icon={Sparkles} text={signal} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  className="button-secondary w-full text-sm"
                  onClick={() => toggleFollow(connection.id)}
                  disabled={isLoading}
                >
                  {connection.youFollow ? 'Unfollow' : 'Follow back'}
                </button>
                <button
                  type="button"
                  className="button-ghost w-full text-sm"
                  onClick={() => toggleInnerCircle(connection.id)}
                  disabled={!connection.isFriend || isLoading}
                  aria-disabled={!connection.isFriend || isLoading}
                >
                  {connection.yourInnerCircle ? 'Remove Inner Circle' : 'Add to Inner Circle'}
                </button>
                <button
                  type="button"
                  className={`button-primary w-full text-sm ${connection.aiChatAllowed ? '' : 'opacity-60'}`}
                  onClick={() => toggleAiChat(connection.id)}
                  disabled={!connection.aiChatEligible || isLoading}
                >
                  {connection.aiChatOptIn ? 'Disable AI chat' : 'Enable AI chat'}
                </button>
              </div>

              <p className="mt-2 text-xs text-brand-mist/60">
                AI chat allowed if: mutual friends + both Inner Circles + both opted in. Current: {connection.isFriend ? 'Friend' : 'Not a friend'},{' '}
                {connection.yourInnerCircle && connection.theirInnerCircle ? 'Dual Inner Circle' : 'Inner Circle incomplete'},{' '}
                {connection.aiChatAllowed ? 'AI chat open' : 'AI chat locked'}.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel surface-panel--stacked mt-6">
        <header className="section-header mb-4">
          <p className="section-label">Relational memory</p>
          <h2 className="section-title">MarAI writes social memory every time the graph shifts</h2>
          <p className="section-description text-brand-mist/70">
            Each memory includes a tone and delta so MarAI can adjust persona responses. Removing friendships reduces the delta,
            while Inner Circle and AI chat openings raise it.
          </p>
        </header>
        <ul className="space-y-2">
          {memoryEvents.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-brand-mist/80"
            >
              <p className="font-semibold text-white">{event.title}</p>
              <p className="text-xs text-brand-mist/60">{event.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-panel surface-panel--stacked mt-6">
        <header className="section-header mb-4">
          <p className="section-label">Discovery logic</p>
          <h2 className="section-title">Mutual discovery powered by TikTok-style signals</h2>
          <p className="section-description text-brand-mist/70">
            Location, time, dream themes, and AI-to-AI exchanges drive recommendations. When reciprocity happens, the friendship
            auto-forms and your MarAI updates relational memory.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          {connections.map((connection) => (
            <article key={connection.id} className="surface-card surface-card--interactive">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
                    <Image src={connection.avatar} alt={connection.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{connection.name}</p>
                    <p className="text-xs text-brand-mist/60">{connection.tagline}</p>
                  </div>
                </div>
                <Badge label={connection.isFriend ? 'Friend' : 'Suggested'} tone="primary" />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-brand-mist/70">
                {connection.locationSignal && <SignalRow icon={LocateIcon} text={connection.locationSignal} />}
                {connection.postingOverlap && <SignalRow icon={Clock3} text={connection.postingOverlap} />}
                {connection.dreamLink && <SignalRow icon={Sparkles} text={connection.dreamLink} />}
                {connection.aiToAiSignal && <SignalRow icon={Brain} text={connection.aiToAiSignal} />}
                {connection.signals?.map((signal) => (
                  <SignalRow key={signal} icon={Sparkles} text={signal} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="space-y-1 text-sm text-brand-mist/70">
          <p className="text-white">Need to expand this system?</p>
          <p>We can generate the ERD, permission logic, and endpoint contracts the moment you are ready.</p>
        </div>
        <Link href="/chat" className="button-primary inline-flex items-center gap-2 text-sm">
          Talk with Amaris
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  )
}

function isFriend(connection: Connection) {
  return connection.youFollow && connection.followsYou
}

function isAiChatEligible(connection: Connection, globalOptIn: boolean) {
  return isFriend(connection) && connection.yourInnerCircle && connection.theirInnerCircle && globalOptIn
}

function isAiChatAllowed(connection: Connection, globalOptIn: boolean) {
  return isAiChatEligible(connection, globalOptIn) && connection.aiChatOptIn
}

type BadgeTone = 'primary' | 'accent' | 'glow'

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const toneClass =
    tone === 'accent'
      ? 'bg-amber-400/15 text-amber-200'
      : tone === 'glow'
        ? 'bg-emerald-400/15 text-emerald-200'
        : 'bg-white/10 text-brand-mist/70'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ${toneClass}`}>
      {label}
    </span>
  )
}

function InfoCard({
  title,
  description,
  badge,
  icon: Icon,
  children,
}: {
  title: string
  description: string
  badge: string
  icon: typeof Sparkles
  children?: ReactNode
}) {
  return (
    <article className="surface-card surface-card--interactive surface-card--stacked">
      <div className="surface-card__icon-ring">
        <Icon className="h-5 w-5" />
      </div>
      <div className="surface-card__content">
        <div className="flex items-center justify-between gap-2">
          <h3 className="surface-card__title">{title}</h3>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-brand-mist/60">{badge}</span>
        </div>
        <p className="surface-card__body">{description}</p>
        {children}
      </div>
    </article>
  )
}

function SignalPill({ icon: Icon, text }: { icon: ComponentType<ComponentProps<'svg'>>; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/5 px-2 py-1">
      <Icon className="h-3 w-3" />
      {text}
    </span>
  )
}

function SignalRow({ icon: Icon, text }: { icon: ComponentType<ComponentProps<'svg'>>; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  )
}

function LocateIcon(props: React.ComponentProps<'svg'>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95-6.95-1.414 1.414M6.464 17.536 5.05 18.95m0-13.9 1.414 1.414m11.486 9.172 1.414 1.414M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
