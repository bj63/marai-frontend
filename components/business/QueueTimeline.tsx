'use client'

import { CheckCircle2, Clock3, Rocket } from 'lucide-react'
import { useMemo } from 'react'
import SentimentBadge from '@/components/business/SentimentBadge'
import type { AutopostQueueEntry, AutopostStatus } from '@/types/business'

interface QueueTimelineProps {
  entries: AutopostQueueEntry[]
  loading?: boolean
  error?: string | null
}

const statusConfig: Record<AutopostStatus, { label: string; icon: typeof Clock3; color: string }> = {
  scheduled: { label: 'Scheduled', icon: Clock3, color: 'text-sky-300' },
  publishing: { label: 'Publishing', icon: Rocket, color: 'text-amber-200' },
  published: { label: 'Published', icon: CheckCircle2, color: 'text-emerald-300' },
}

const formatTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Pending'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function QueueTimeline({ entries, loading, error }: QueueTimelineProps) {
  const grouped = useMemo(() => {
    return entries.reduce<Record<AutopostStatus, AutopostQueueEntry[]>>(
      (acc, entry) => {
        acc[entry.status] = acc[entry.status] ? [...acc[entry.status], entry] : [entry]
        return acc
      },
      { scheduled: [], publishing: [], published: [] },
    )
  }, [entries])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        Loading queue…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-sm text-rose-100">
        {error}
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white">Queue timeline</h3>
      <p className="mt-1 text-sm text-slate-400">Review scheduled, publishing, and live drops.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {(['scheduled', 'publishing', 'published'] as AutopostStatus[]).map((status) => {
          const config = statusConfig[status]
          const items = grouped[status]
          const Icon = config.icon
          return (
            <section key={status} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <header className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] ${config.color}`}>
                  <Icon className="h-4 w-4" />
                  {config.label}
                </div>
                <span className="text-xs text-slate-500">{items.length} drops</span>
              </header>
              <ul className="mt-4 flex flex-col gap-4">
                {items.length === 0 && (
                  <li className="rounded-xl border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-400">
                    Nothing here yet. Ship a campaign.
                  </li>
                )}
                {items.map((entry) => {
                  const sentiment = entry.sentimentSignals[0]
                  return (
                    <li key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">
                        {entry.details?.title ?? entry.title ?? 'Untitled drop'}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {formatTime(entry.scheduledAt)}
                      </p>
                      {sentiment && (
                        <div className="mt-3">
                          <SentimentBadge label={sentiment.label} confidence={sentiment.confidence} />
                        </div>
                      )}
                      {entry.details?.callToAction?.label && (
                        <p className="mt-3 text-xs text-emerald-200">
                          CTA: {entry.details.callToAction.label}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
