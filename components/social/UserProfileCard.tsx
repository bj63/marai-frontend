'use client'

import Image from 'next/image'

export interface UserProfileCardProps {
  username: string
  avatarUrl: string
  tagline?: string
  trustLevel?: number
  personalitySummary?: string
  badges?: string[]
  stats?: Array<{ label: string; value: string }>
  onOpenProfile?: () => void
}

export function UserProfileCard({
  username,
  avatarUrl,
  tagline,
  trustLevel,
  personalitySummary,
  badges = [],
  stats = [],
  onOpenProfile,
}: UserProfileCardProps) {
  const trustPercent = Math.min(Math.max(trustLevel ?? 0, 0), 1) * 100

  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-white shadow-xl backdrop-blur">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/20">
            <Image src={avatarUrl} alt={`${username} avatar`} fill unoptimized sizes="80px" className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{username}</h2>
            {tagline && <p className="text-sm text-white/70">{tagline}</p>}
          </div>
        </div>

        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
          >
            View Profile
          </button>
        )}
      </header>

      {typeof trustLevel === 'number' && (
        <section>
          <div className="mb-2 flex items-center justify-between text-sm text-white/70">
            <span>Trust Level</span>
            <span>{trustPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${trustPercent}%` }} />
          </div>
        </section>
      )}

      {personalitySummary && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Personality Snapshot</h3>
          <p className="text-sm leading-relaxed text-white/80">{personalitySummary}</p>
        </section>
      )}

      {badges.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section className="grid grid-cols-2 gap-4 text-sm text-white/80 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">{stat.label}</p>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </section>
      )}
    </article>
  )
}

export default UserProfileCard
