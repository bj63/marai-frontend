'use client'

import { useMemo } from 'react'

const TRAIT_TITLES: Record<string, string> = {
  empathy: 'Empathy',
  creativity: 'Creativity',
  confidence: 'Confidence',
  curiosity: 'Curiosity',
  humor: 'Humor',
  energy: 'Energy',
}

const TRAIT_ROLES: Record<string, string> = {
  empathy: 'Luminous Guide',
  creativity: 'Mythic Weaver',
  confidence: 'Resolute Vanguard',
  curiosity: 'Arcane Seeker',
  humor: 'Sparkcaster',
  energy: 'Pulse Dancer',
}

interface PersonaCardProps {
  aura: string
  personality: Record<string, number>
  address?: string | null
}

const PLACEHOLDER_TRAITS: Array<[string, number]> = [
  ['creativity', 0.62],
  ['curiosity', 0.55],
  ['empathy', 0.53],
]

export default function PersonaCard({ aura, personality, address }: PersonaCardProps) {
  const traits = useMemo(() => {
    const entries = Object.entries(personality)
      .filter(([, value]) => typeof value === 'number' && !Number.isNaN(value))
      .sort((a, b) => b[1] - a[1])

    if (entries.length === 0) {
      return PLACEHOLDER_TRAITS
    }

    return entries
  }, [personality])

  const topRole = traits[0]?.[0]
  const dominantTitle = topRole ? TRAIT_ROLES[topRole] ?? `Aspect of ${topRole}` : 'Awaiting Resonance'

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: 0.25 + Math.random() * 0.35,
        size: 0.75 + Math.random() * 1.25,
      })),
    [aura]
  )

  return (
    <div className="persona-card">
      <div className="persona-card__inner">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.32em] opacity-70">
          <span>Mirai Persona</span>
          <span>{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Guest'}</span>
        </header>

        <div className="mt-3">
          <div className="text-[0.65rem] uppercase tracking-[0.45em] opacity-70">Designation</div>
          <div className="mt-1 text-lg font-semibold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
            {dominantTitle}
          </div>
        </div>

        <div className="relative mt-4 h-40 w-full overflow-hidden rounded-xl">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 20%, ${aura} 0%, rgba(12, 15, 24, 0.4) 55%, rgba(8, 10, 16, 0.95) 100%)`,
            }}
          />
          <div className="absolute inset-0 border border-white/10 rounded-xl" />
          {sparkles.map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute rounded-full"
              style={{
                background: aura,
                opacity: sparkle.opacity,
                top: sparkle.top,
                left: sparkle.left,
                filter: 'blur(1px)',
                width: `${sparkle.size}rem`,
                height: `${sparkle.size}rem`,
              }}
            />
          ))}
          <div className="absolute inset-x-4 bottom-4 text-center text-[0.65rem] uppercase tracking-[0.5em] text-white/80">
            Aura Flux
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-[0.6rem] uppercase tracking-[0.32em]">
          {traits.slice(0, 3).map(([trait, value]) => (
            <div key={trait} className="persona-card__badge">
              <span>{TRAIT_TITLES[trait] ?? trait}</span>
              <span>{Math.round(value * 100)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {traits.slice(0, 6).map(([trait, value]) => (
            <div key={trait}>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] opacity-70">
                <span>{TRAIT_TITLES[trait] ?? trait}</span>
                <span>{Math.round(value * 100)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, Math.round(value * 100)))}%`,
                    background: aura,
                    boxShadow: `0 0 12px ${aura}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
