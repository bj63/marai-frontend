import { adaptiveTokens, type EmotionQuadrant } from './tokens'
import type { AdaptiveContentZone, NormalizedTheme } from './types'

export interface ThemeResolverInput {
  theme: NormalizedTheme
  emotion: EmotionQuadrant
  reducedMotion?: boolean
}

export type ZoneStyles = Record<AdaptiveContentZone, { background: string; border: string; glow: string }>

export interface ResolvedAdaptiveTheme {
  emotion: EmotionQuadrant
  palette: {
    primary: string
    accent: string
    background: string
    neutral: string
    surface: string
    stroke: string
  }
  cssVariables: Record<string, string>
  zones: ZoneStyles
  motion: { duration: number; easing: string }
}

const buildGradient = (stops: { from: string; via?: string; to: string }): string => {
  const viaStop = stops.via ? `, ${stops.via} 50%` : ''
  return `linear-gradient(135deg, ${stops.from} 0%${viaStop}, ${stops.to} 100%)`
}

export function resolveAdaptiveTheme(input: ThemeResolverInput): ResolvedAdaptiveTheme {
  const palette = {
    primary: input.theme.design_dna.palette.primary ?? adaptiveTokens.colors.accent.electric,
    accent: input.theme.design_dna.palette.accent ?? adaptiveTokens.colors.accent.primary,
    background: input.theme.design_dna.palette.background ?? adaptiveTokens.colors.neutral.midnight,
    neutral: input.theme.design_dna.palette.neutral ?? adaptiveTokens.colors.neutral.mist,
    surface: input.theme.design_dna.theme_tokens.surface ?? 'rgba(200, 210, 225, 0.08)',
    stroke: input.theme.design_dna.theme_tokens.stroke ?? 'rgba(200, 210, 225, 0.22)',
  }

  const emotion = adaptiveTokens.emotion[input.emotion]
  const gradient = buildGradient(emotion.gradient)
  const zones = Object.entries(adaptiveTokens.surfaces).reduce<ZoneStyles>((acc, [key, value]) => {
    acc[key as AdaptiveContentZone] = {
      background: `color-mix(in srgb, ${palette.background} 70%, ${value.base})`,
      border: `1px solid color-mix(in srgb, ${palette.stroke} 65%, ${value.outline})`,
      glow: `0 20px 60px ${emotion.halo}`,
    }
    return acc
  }, {} as ZoneStyles)

  const easing = adaptiveTokens.motion.easing[emotion.motionCurve]
  const duration = input.reducedMotion ? adaptiveTokens.motion.duration.subtle : adaptiveTokens.motion.duration.base

  const cssVariables: Record<string, string> = {
    '--design-primary': palette.primary,
    '--design-accent': palette.accent,
    '--design-background': palette.background,
    '--design-neutral': palette.neutral,
    '--design-surface': palette.surface,
    '--design-stroke': palette.stroke,
    '--design-font-family': input.theme.design_dna.font ?? "var(--font-body, 'Inter', sans-serif)",
    '--emotion-gradient': gradient,
    '--emotion-halo': emotion.halo,
    '--emotion-border': emotion.border,
    '--emotion-blur': emotion.blur,
    '--hero-template-background': zones.hero.background,
    '--summary-template-background': zones.summary.background,
    '--card-template-background': zones.cards.background,
    '--autopost-template-background': zones.autopost.background,
    '--summary-template-border': zones.summary.border,
    '--card-template-border': zones.cards.border,
    '--motion-duration-base': `${duration}ms`,
    '--motion-easing-base': easing,
    '--emotion-icon-color': emotion.icon,
  }

  return {
    emotion: input.emotion,
    palette,
    cssVariables,
    zones,
    motion: { duration, easing },
  }
}

