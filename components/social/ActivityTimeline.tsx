'use client'

export interface ActivityTimelineItem {
  id: string
  title: string
  description: string
  timestamp: string
  category?: 'milestone' | 'memory' | 'connection'
  moodColor?: string
}

export interface ActivityTimelineProps {
  items: ActivityTimelineItem[]
  emptyState?: string
}

type ActivityCategory = NonNullable<ActivityTimelineItem['category']>

const CATEGORY_STYLES: Record<ActivityCategory, string> = {
  milestone: 'bg-emerald-500/20 text-emerald-200',
  memory: 'bg-indigo-500/20 text-indigo-200',
  connection: 'bg-rose-500/20 text-rose-200',
}

export function ActivityTimeline({ items, emptyState = 'No activity yet. Start a new journey with your Marai.' }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70 backdrop-blur">
        <p>{emptyState}</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="mb-6 text-lg font-semibold text-white">Activity Timeline</h2>
      <ol className="relative space-y-6 border-l border-white/10 pl-6">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const tone = item.category ? CATEGORY_STYLES[item.category] : 'bg-white/10 text-white/70'

          return (
            <li key={item.id} className="relative space-y-2 text-sm text-white/80">
              <span
                className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/70"
                style={{ boxShadow: item.moodColor ? `0 0 12px ${item.moodColor}` : undefined }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: item.moodColor ?? 'linear-gradient(135deg, #5EEAD4, #818CF8)' }}
                />
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                {item.category && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>{item.category}</span>}
                <time className="text-xs uppercase tracking-wide text-white/50">{item.timestamp}</time>
              </div>

              <p className="leading-relaxed text-white/70">{item.description}</p>

              {!isLast && <span className="absolute -left-px top-6 h-full w-px bg-gradient-to-b from-white/20 to-transparent" />}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default ActivityTimeline
