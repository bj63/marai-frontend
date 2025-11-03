'use client'

import { Flame, MessageCircle, Music, Radio } from 'lucide-react'
import type { ActivityEvent } from '@/lib/socialDataStore'

type SocialActivityReelProps = {
  events: ActivityEvent[]
  loading?: boolean
}

const channelIcon: Record<ActivityEvent['channel'], typeof Flame> = {
  feed: Flame,
  chat: MessageCircle,
  ritual: Radio,
  call: Music,
}

function formatRelative(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SocialActivityReel({ events, loading = false }: SocialActivityReelProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 85%,transparent)] bg-[color-mix(in srgb,var(--design-background) 82%,#131a3a)] p-5 text-sm text-[color-mix(in srgb,var(--design-neutral) 78%,#94a3b8)]">
        <header className="mb-4 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">Activity pulse</header>
        <p>Syncing engagement telemetry…</p>
      </section>
    )
  }

  if (!events.length) {
    return (
      <section className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 85%,transparent)] bg-[color-mix(in srgb,var(--design-background) 82%,#131a3a)] p-5 text-sm text-[color-mix(in srgb,var(--design-neutral) 78%,#94a3b8)]">
        <header className="mb-4 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">Activity pulse</header>
        <p>No recent signals. Keep posting, chatting, or sharing rituals to wake the reel.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 85%,transparent)] bg-[color-mix(in srgb,var(--design-background) 82%,#131a3a)] p-5 text-[color-mix(in srgb,var(--design-neutral) 82%,#f8fafc)]">
      <header className="mb-4 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">Activity pulse</header>
      <ul className="space-y-4">
        {events.map((event) => {
          const Icon = channelIcon[event.channel]
          return (
            <li key={event.id} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color-mix(in srgb,var(--design-stroke) 75%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#182347)]">
                <Icon className="h-4 w-4 text-[color-mix(in srgb,var(--design-accent) 80%,#22d3ee)]" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{event.title}</p>
                <p className="text-sm text-[color-mix(in srgb,var(--design-neutral) 70%,#94a3b8)]">{event.subtitle}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">
                  {formatRelative(event.occurredAt)} • {event.emotion} • {Math.round(event.intensity * 100)}% resonance
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default SocialActivityReel
