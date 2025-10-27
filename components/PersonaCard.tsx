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

const TRAIT_PROMPT_CUES: Record<
  string,
  {
    palette: string
    vibe: string
    motif: string
    camera: string
  }
> = {
  empathy: {
    palette: 'soft pastel teal & opal glow',
    vibe: 'gentle expression, compassionate eyes',
    motif: 'floating light petals',
    camera: 'portrait bust, slight tilt, diffused light',
  },
  creativity: {
    palette: 'neon magenta & sunlit peach rim light',
    vibe: 'imaginative aura, playful smirk',
    motif: 'trailing ink ribbons and holographic glyphs',
    camera: 'three-quarter view, dynamic composition',
  },
  confidence: {
    palette: 'molten gold & midnight violet highlights',
    vibe: 'heroic posture, unwavering gaze',
    motif: 'rising pillar of light fragments',
    camera: 'low angle, cinematic lighting',
  },
  curiosity: {
    palette: 'cerulean & ultraviolet bloom',
    vibe: 'wide-eyed wonder, inquisitive tilt',
    motif: 'orbiting data sprites',
    camera: 'over-the-shoulder with depth of field',
  },
  humor: {
    palette: 'vibrant tangerine & electric cyan glints',
    vibe: 'mischievous grin, lighthearted energy',
    motif: 'floating chibi masks',
    camera: 'close-up, playful lens flare',
  },
  energy: {
    palette: 'scarlet neon & cobalt trails',
    vibe: 'kinetic motion, windswept hair',
    motif: 'speedline auroras',
    camera: 'dynamic dutch angle, motion blur',
  },
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

  const promptBlueprint = useMemo(() => {
    const topTraits = traits.slice(0, 3).map(([trait]) => trait)
    if (topTraits.length === 0) {
      return {
        prompt:
          'anime portrait of a future-mystic navigator bathed in cyan aura, volumetric lighting, ultra-detailed illustration, studio quality',
        tags: ['anime portrait', 'volumetric light', 'ultra detail'],
        negative:
          'low detail, dull lighting, muted colors, distorted anatomy, text overlay',
      }
    }

    const cues = topTraits.map((trait) => TRAIT_PROMPT_CUES[trait]).filter(Boolean)

    const palette = cues.map((cue) => cue?.palette).filter(Boolean).join(', ')
    const vibe = cues.map((cue) => cue?.vibe).filter(Boolean).join(' · ')
    const motif = cues.map((cue) => cue?.motif).filter(Boolean).join(' + ')
    const camera = cues.map((cue) => cue?.camera).filter(Boolean).join(' | ')

    return {
      prompt: `anime illustration of the ${dominantTitle.toLowerCase()} persona, ${vibe}. ${motif}. palette: ${palette}. ${camera}. rendered in ultra-detailed midjourney style, iridescent lighting, 4k concept art`,
      tags: [
        'midjourney v6',
        dominantTitle.toLowerCase(),
        ...topTraits.map((trait) => `${trait} core`),
      ],
      negative:
        'lowres, blurred details, flat shading, deformed proportions, watermark, text, duplicated limbs',
    }
  }, [dominantTitle, traits])

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

        <div className="relative mt-4 h-44 w-full overflow-hidden rounded-xl persona-card__art">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 40% 15%, ${aura} 0%, rgba(12, 15, 24, 0.3) 40%, rgba(6, 8, 18, 0.92) 100%)`,
            }}
          />
          <div className="absolute inset-0 border border-white/15 rounded-xl" />
          <div className="absolute inset-6 rounded-full border border-white/10" />
          <div className="persona-card__art-gloss" />
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
            Aura Flux Render
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

        <div className="mt-6 space-y-2">
          <div className="persona-card__prompt">
            <div className="persona-card__prompt-label">Dream Prompt</div>
            <div className="persona-card__prompt-body">{promptBlueprint.prompt}</div>
          </div>
          <div className="persona-card__tags">
            {promptBlueprint.tags.map((tag) => (
              <span key={tag} className="persona-card__tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="persona-card__negative">
            <span className="persona-card__prompt-label">Negative Prompt</span>
            <span className="persona-card__prompt-body">{promptBlueprint.negative}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
