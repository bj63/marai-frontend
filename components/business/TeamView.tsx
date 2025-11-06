'use client'

import { Calendar, MessageSquare } from 'lucide-react'
import SentimentBadge from '@/components/business/SentimentBadge'
import { useBusinessData, type BusinessDataContextValue } from '@/components/business/BusinessDataContext'

const buildReflections = (autoposts: BusinessDataContextValue['autoposts']) => {
  return autoposts.flatMap((entry) => {
    const aggregate = entry.emotionState && Array.isArray((entry.emotionState as any).aggregate)
      ? ((entry.emotionState as any).aggregate as Array<Record<string, unknown>>)
      : []

    return aggregate.map((signal, index) => {
      const label = typeof signal.label === 'string' ? signal.label : 'reflective'
      const confidence =
        typeof signal.confidence === 'number' && Number.isFinite(signal.confidence)
          ? signal.confidence
          : 0.5
      return {
        id: `${entry.id}-${index}`,
        author: entry.ownerId,
        role: 'Contributor',
        note: entry.summary ?? entry.body.slice(0, 120),
        timestamp: entry.updatedAt,
        sentiment: { label, confidence },
      }
    })
  })
}

export default function TeamView() {
  const { autoposts } = useBusinessData()
  const reflections = buildReflections(autoposts)

  if (reflections.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
        Invite employees to reflect on campaigns so their emotions surface here.
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {reflections.map((reflection) => (
        <article key={reflection.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{reflection.author}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{reflection.role}</p>
            </div>
            <SentimentBadge label={reflection.sentiment.label} confidence={reflection.sentiment.confidence} />
          </div>
          <p className="mt-4 text-sm text-slate-300">{reflection.note}</p>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(reflection.timestamp).toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Campaign pulse
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}
