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
  milestone: 'bg-brand-bayou/20 text-brand-bayou',
  memory: 'bg-brand-magnolia/20 text-brand-magnolia',
  connection: 'bg-brand-cypress/20 text-brand-cypress',
}

export function ActivityTimeline({ items, emptyState = 'No activity yet. Start a new journey with your Marai.' }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-brand-mist/15 bg-brand-midnight/70 p-6 text-center text-brand-mist/70 backdrop-blur">
        <p>{emptyState}</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-brand-mist/15 bg-brand-midnight/70 p-6 backdrop-blur">
      <h2 className="mb-6 text-lg font-semibold text-brand-mist/90">Activity Timeline</h2>
      <ol className="relative space-y-6 border-l border-brand-mist/15 pl-6">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const tone = item.category ? CATEGORY_STYLES[item.category] : 'bg-brand-mist/10 text-brand-mist/70'

          return (
            <li key={item.id} className="relative space-y-2 text-sm text-brand-mist/80">
              <span
                className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border border-brand-mist/20 bg-brand-midnight"
                style={{ boxShadow: item.moodColor ? `0 0 12px ${item.moodColor}` : undefined }}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: item.moodColor ?? 'linear-gradient(135deg, #A47CFF, #3CE0B5, #FF9ECF)' }}
                />
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-brand-mist/95">{item.title}</h3>
                {item.category && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tone}`}>{item.category}</span>}
                <time className="text-xs uppercase tracking-wide text-brand-mist/50">{item.timestamp}</time>
              </div>

              <p className="leading-relaxed text-brand-mist/70">{item.description}</p>

              {!isLast && <span className="absolute -left-px top-6 h-full w-px bg-gradient-to-b from-brand-magnolia/40 via-transparent to-transparent" />}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default ActivityTimeline
