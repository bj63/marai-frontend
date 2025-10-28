'use client'

import { useMemo } from 'react'

function hashSeed(input: string) {
  let hash = 1779033703 ^ input.length
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
  hash ^= hash >>> 16
  return hash >>> 0
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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
  aura?: string | null
  personality: Record<string, number>
  address?: string | null
  loading?: boolean
  error?: string | null
}

const PLACEHOLDER_TRAITS: Array<[string, number]> = [
  ['creativity', 0.62],
  ['curiosity', 0.55],
  ['empathy', 0.53],
]

export default function PersonaCard({ aura, personality, address, loading, error }: PersonaCardProps) {
  const safeAura = aura && aura.trim().length > 0 ? aura : 'hsl(188, 82%, 62%)'

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

  const statusLabel = error ? 'Signal Lost' : loading ? 'Calibrating' : 'Synchronized'
  const statusDetail = error ? error : loading ? 'Tuning personality lattice…' : 'Persona signature locked in'

  const sparkleSeed = useMemo(() => hashSeed(`${safeAura}-${address ?? 'guest'}-${dominantTitle}`), [safeAura, address, dominantTitle])
  const sparkles = useMemo(() => {
    const random = mulberry32(sparkleSeed)
    return Array.from({ length: 12 }, (_, index) => ({
      id: index,
      top: `${random() * 100}%`,
      left: `${random() * 100}%`,
      opacity: 0.25 + random() * 0.35,
      size: 0.75 + random() * 1.25,
    }))
  }, [sparkleSeed])

  const promptBlueprint = useMemo(() => {
    const topTraits = traits.slice(0, 3).map(([trait]) => trait)
    if (topTraits.length === 0) {
      return {
        prompt:
          'anime portrait of a future-mystic navigator bathed in cyan aura, volumetric lighting, ultra-detailed illustration, studio quality',
        tags: ['midjourney v6', 'persona', 'empathy core'],
        negative: 'low detail, dull lighting, muted colors, distorted anatomy, text overlay',
        palette: 'opalescent cyan & prismatic rose glow',
        vibe: 'calm poise, empathetic aura',
        motif: 'floating light petals',
        camera: 'portrait bust, soft volumetric lighting',
      }
    }

    const cues = topTraits.map((trait) => TRAIT_PROMPT_CUES[trait]).filter(Boolean)

    const palette = cues
      .map((cue) => cue?.palette)
      .filter(Boolean)
      .join(', ')
    const vibe = cues
      .map((cue) => cue?.vibe)
      .filter(Boolean)
      .join(' · ')
    const motif = cues
      .map((cue) => cue?.motif)
      .filter(Boolean)
      .join(' + ')
    const camera = cues
      .map((cue) => cue?.camera)
      .filter(Boolean)
      .join(' | ')

    const cleanedPalette = palette || 'opalescent cyan & prismatic rose glow'
    const cleanedVibe = vibe || 'calm poise, empathetic aura'
    const cleanedMotif = motif || 'floating light petals'
    const cleanedCamera = camera || 'portrait bust, soft volumetric lighting'
    const dominantSlug = dominantTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'persona'

    return {
      prompt: `anime illustration of the ${dominantTitle.toLowerCase()} persona, ${cleanedVibe}. ${cleanedMotif}. palette: ${cleanedPalette}. ${cleanedCamera}. rendered in ultra-detailed midjourney style, iridescent lighting, 4k concept art`,
      tags: ['midjourney v6', dominantSlug, ...topTraits.map((trait) => `${trait} core`)],
      negative: 'lowres, blurred details, flat shading, deformed proportions, watermark, text, duplicated limbs',
      palette: cleanedPalette,
      vibe: cleanedVibe,
      motif: cleanedMotif,
      camera: cleanedCamera,
    }
  }, [dominantTitle, traits])

  return (
    <div className="persona-card">
      <div className="persona-card__inner">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.32em] opacity-70">
          <span>Mirai Persona</span>
          <span>{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Guest'}</span>
        </header>

        <div
          className={`persona-card__status ${
            error ? 'persona-card__status--error' : loading ? 'persona-card__status--loading' : 'persona-card__status--ready'
          }`}
          aria-live="polite"
        >
          <span className="persona-card__status-label">{statusLabel}</span>
          <span className="persona-card__status-detail">{statusDetail}</span>
        </div>

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
              background: `radial-gradient(circle at 40% 15%, ${safeAura} 0%, rgba(12, 15, 24, 0.3) 40%, rgba(6, 8, 18, 0.92) 100%)`,
            }}
          />
          <div className="absolute inset-0 border border-white/15 rounded-xl" />
          <div className="absolute inset-6 rounded-full border border-white/10" />
          <div className="persona-card__art-gloss" />
          {sparkles.map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute rounded-full"
              style={{
                background: safeAura,
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
                    background: safeAura,
                    boxShadow: `0 0 12px ${safeAura}`,
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
          <dl className="persona-card__blueprint">
            <div>
              <dt>Palette</dt>
              <dd>{promptBlueprint.palette}</dd>
            </div>
            <div>
              <dt>Energy</dt>
              <dd>{promptBlueprint.vibe}</dd>
            </div>
            <div>
              <dt>Motifs</dt>
              <dd>{promptBlueprint.motif}</dd>
            </div>
            <div>
              <dt>Camera</dt>
              <dd>{promptBlueprint.camera}</dd>
            </div>
          </dl>
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
