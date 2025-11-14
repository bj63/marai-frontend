import type { AdaptiveContentZone } from './types'

export type EmotionQuadrant = 'calm' | 'optimistic' | 'urgent' | 'reflective' | 'charged'
type MotionCurve = 'gentle' | 'responsive' | 'urgent' | 'reflective'

type GradientStops = { from: string; via?: string; to: string }

export const adaptiveTokens = {
  colors: {
    base: {
      50: '#f5f6fb',
      100: '#e2e7fb',
      200: '#c4d0f9',
      300: '#9cb0f6',
      400: '#7d94f0',
      500: '#6376e3',
      600: '#4c5ed4',
      700: '#3745b7',
      800: '#1f2b7f',
      900: '#040711',
    },
    accent: {
      primary: '#70f5d1',
      glow: '#3ce0b5',
      electric: '#a47cff',
      amber: '#f5c06a',
    },
    neutral: {
      mist: '#c8d2e1',
      slate: '#94a3b8',
      stone: '#4a5164',
      midnight: '#0b1024',
    },
    states: {
      success: '#70f5d1',
      warning: '#facc15',
      danger: '#fb7185',
      info: '#93c5fd',
    },
  },
  typography: {
    hero: { fontSize: '3.5rem', lineHeight: 1.05, letterSpacing: '-0.02em', weight: 600 },
    summary: { fontSize: '1.5rem', lineHeight: 1.3, letterSpacing: '-0.01em', weight: 500 },
    body: { fontSize: '1rem', lineHeight: 1.6, letterSpacing: '-0.005em', weight: 400 },
    meta: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.32em', weight: 500 },
  },
  spacing: {
    unit: 4,
    grid: (step: number) => `${step * 4}px`,
    stack: {
      tight: '8px',
      cozy: '12px',
      airy: '16px',
      roomy: '24px',
      generous: '32px',
    },
  },
  radii: {
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    pill: '999px',
  },
  shadows: {
    low: '0 12px 30px rgba(4, 7, 17, 0.35)',
    medium: '0 20px 45px rgba(4, 7, 17, 0.45)',
    high: '0 35px 90px rgba(4, 7, 17, 0.55)',
    focus: '0 0 0 1px rgba(112, 245, 209, 0.65)',
  },
  motion: {
    duration: {
      subtle: 280,
      base: 220,
      snappy: 160,
      prolonged: 420,
    },
    easing: {
      gentle: 'cubic-bezier(0.33, 1, 0.68, 1)',
      responsive: 'cubic-bezier(0.22, 1, 0.36, 1)',
      urgent: 'cubic-bezier(0.65, 0, 0.35, 1)',
      reflective: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    } as Record<MotionCurve, string>,
  },
  surfaces: {
    ["hero" as AdaptiveContentZone]: {
      base: 'rgba(12, 18, 40, 0.75)',
      outline: 'rgba(255, 255, 255, 0.08)',
    },
    ["summary" as AdaptiveContentZone]: {
      base: 'rgba(18, 23, 55, 0.85)',
      outline: 'rgba(255, 255, 255, 0.12)',
    },
    ["cards" as AdaptiveContentZone]: {
      base: 'rgba(16, 22, 48, 0.92)',
      outline: 'rgba(255, 255, 255, 0.1)',
    },
    ["autopost" as AdaptiveContentZone]: {
      base: 'rgba(17, 23, 50, 0.9)',
      outline: 'rgba(255, 255, 255, 0.12)',
    },
  } as Record<AdaptiveContentZone, { base: string; outline: string }>,
  emotion: {
    calm: {
      label: 'calm',
      gradient: { from: '#1f3a8a', to: '#0f172a' } satisfies GradientStops,
      halo: 'rgba(112, 245, 209, 0.25)',
      blur: '28px',
      border: 'rgba(112, 245, 209, 0.35)',
      icon: '#70f5d1',
      motionCurve: 'gentle',
    },
    optimistic: {
      label: 'optimistic',
      gradient: { from: '#70f5d1', to: '#3ce0b5' } satisfies GradientStops,
      halo: 'rgba(164, 124, 255, 0.45)',
      blur: '36px',
      border: 'rgba(164, 124, 255, 0.45)',
      icon: '#a47cff',
      motionCurve: 'responsive',
    },
    urgent: {
      label: 'urgent',
      gradient: { from: '#fb7185', to: '#f97316' } satisfies GradientStops,
      halo: 'rgba(248, 113, 113, 0.5)',
      blur: '42px',
      border: 'rgba(249, 115, 22, 0.65)',
      icon: '#f97316',
      motionCurve: 'urgent',
    },
    reflective: {
      label: 'reflective',
      gradient: { from: '#7dd3fc', to: '#312e81' } satisfies GradientStops,
      halo: 'rgba(125, 211, 252, 0.45)',
      blur: '32px',
      border: 'rgba(125, 211, 252, 0.45)',
      icon: '#7dd3fc',
      motionCurve: 'reflective',
    },
    charged: {
      label: 'charged',
      gradient: { from: '#a47cff', via: '#f472b6', to: '#facc15' } satisfies GradientStops,
      halo: 'rgba(244, 114, 182, 0.55)',
      blur: '48px',
      border: 'rgba(250, 204, 21, 0.75)',
      icon: '#facc15',
      motionCurve: 'responsive',
    },
  } as Record<EmotionQuadrant, {
    label: EmotionQuadrant
    gradient: GradientStops
    halo: string
    blur: string
    border: string
    icon: string
    motionCurve: MotionCurve
  }>,
} as const

export type AdaptiveTokens = typeof adaptiveTokens

