'use client'

import { Activity, Clock } from 'lucide-react'
import type { RelationshipTimelineEvent } from '@/lib/socialDataStore'

type RelationshipTimelineProps = {
  events: RelationshipTimelineEvent[]
  loading?: boolean
}

function formatTimestamp(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RelationshipTimeline({ events, loading = false }: RelationshipTimelineProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 85%,transparent)] bg-[color-mix(in srgb,var(--design-background) 82%,#131a3a)] p-5 text-sm text-[color-mix(in srgb,var(--design-neutral) 78%,#94a3b8)]">
        <header className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
          <Clock className="h-4 w-4" /> Relationship timeline
        </header>
        <p>Fetching the latest milestones…</p>
      </section>
    )
  }

  if (!events.length) {
    return (
      <section className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 85%,transparent)] bg-[color-mix(in srgb,var(--design-background) 82%,#131a3a)] p-5 text-sm text-[color-mix(in srgb,var(--design-neutral) 78%,#94a3b8)]">
        <header className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
          <Clock className="h-4 w-4" /> Relationship timeline
        </header>
        <p>No milestones yet. Share how you feel and Amaris will map the evolution.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[color-mix(in srgb,var(--design-stroke) 85%,transparent)] bg-[color-mix(in srgb,var(--design-background) 82%,#131a3a)] p-5 text-[color-mix(in srgb,var(--design-neutral) 82%,#f8fafc)]">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
          <Clock className="h-4 w-4" /> Relationship timeline
        </div>
        <span className="text-[0.65rem] text-[color-mix(in srgb,var(--design-neutral) 50%,#94a3b8)]">Latest {events.length} updates</span>
      </header>

      <ol className="relative space-y-5">
        <span className="absolute left-2 top-0 h-full w-px bg-[color-mix(in srgb,var(--design-stroke) 75%,transparent)]" aria-hidden />
        {events.map((event) => (
          <li key={event.id} className="relative pl-8">
            <span className="absolute left-0 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color-mix(in srgb,var(--design-stroke) 65%,transparent)] bg-[color-mix(in srgb,var(--design-background) 70%,#1f284b)]">
              <Activity className="h-2.5 w-2.5 text-[color-mix(in srgb,var(--design-accent) 85%,#22d3ee)]" />
            </span>
            <div className="text-xs uppercase tracking-[0.32em] text-[color-mix(in srgb,var(--design-neutral) 55%,#94a3b8)]">{event.stage}</div>
            <div className="mt-1 text-sm font-medium text-white">{event.summary}</div>
            <div className="mt-1 flex items-center gap-2 text-[0.7rem] text-[color-mix(in srgb,var(--design-neutral) 60%,#94a3b8)]">
              <span>{formatTimestamp(event.occurredAt)}</span>
              <span aria-hidden>•</span>
              <span className="capitalize">{event.emotion}</span>
              <span aria-hidden>•</span>
              <span className={event.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                {event.delta >= 0 ? '+' : ''}
                {event.delta}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RelationshipTimeline
