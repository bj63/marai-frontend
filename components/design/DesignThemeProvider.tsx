'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getDesignTheme,
  postDesignContext,
  postDesignFeedback,
  type DesignContextRequest,
  type DesignFeedbackPayload,
  type DesignFeedbackResponse,
  type DesignContextResponse,
  type RemoteDesignDNA,
} from '@/lib/api'
import { reportError } from '@/lib/observability'
import {
  saveUserDesignProfile,
  type DesignDNA,
  type UserDesignProfile,
} from '@/lib/supabaseApi'
import { useAuth } from '@/components/auth/AuthProvider'
import type { NormalizedTheme } from '@/lib/theme/types'
import { resolveAdaptiveTheme, type ResolvedAdaptiveTheme } from '@/lib/theme/resolver'
import {
  deriveEmotionQuadrant,
  type EmotionSignalInput,
} from '@/lib/theme/emotion'
import type { EmotionQuadrant } from '@/lib/theme/tokens'

type RelationshipContext = Record<string, unknown>

type DesignInteractionInput = {
  metric: string
  value?: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  targetId?: string
  metadata?: Record<string, unknown>
  relationshipContext?: RelationshipContext
  actionType?: string
}

type QueuedInteraction = DesignInteractionInput & { timestamp: number }

type DesignThemeContextValue = {
  theme: NormalizedTheme
  loading: boolean
  adaptiveEnabled: boolean
  setAdaptiveEnabled: (enabled: boolean) => void
  emotionQuadrant: EmotionQuadrant
  resolvedTheme: ResolvedAdaptiveTheme
  prefersReducedMotion: boolean
  registerEmotionSignal: (signal: EmotionSignalInput | null) => void
  submitEmotionContext: (input: Omit<DesignContextRequest, 'user_id'> & { user_id?: string }) => Promise<NormalizedTheme | null>
  registerInteraction: (interaction: DesignInteractionInput) => void
  flushFeedback: () => Promise<void>
}

const STORAGE_KEY = 'marai:design-theme'
const PENDING_THEME_KEY = 'marai:design-theme-pending'
const ADAPTIVE_KEY = 'marai:design-adaptive-enabled'
const FEEDBACK_INTERVAL_MS = 5000

const DEFAULT_DNA: DesignDNA = {
  layout: 'halo',
  theme_tokens: {
    surface: 'rgba(200, 210, 225, 0.08)',
    stroke: 'rgba(200, 210, 225, 0.22)',
  },
  palette: {
    primary: '#a47cff',
    accent: '#3ce0b5',
    background: '#0b1024',
    neutral: '#c8d2e1',
  },
  motion: {},
  soundscape: {},
  depth: null,
  font: null,
}

const DEFAULT_THEME: NormalizedTheme = {
  design_dna: DEFAULT_DNA,
  evolution_stage: 'v1',
  preferred_emotion: 'calm',
  relational_signature: null,
}

const DesignThemeContext = createContext<DesignThemeContextValue | undefined>(undefined)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeDesignDNA(remote: RemoteDesignDNA | null | undefined, fallback: DesignDNA = DEFAULT_DNA): DesignDNA {
  const palette = {
    ...fallback.palette,
    ...(isRecord(remote?.palette) ? (remote?.palette as Record<string, string>) : {}),
  }

  const themeTokens = {
    ...fallback.theme_tokens,
    ...(isRecord(remote?.theme_tokens) ? (remote?.theme_tokens as Record<string, string>) : {}),
  }

  return {
    layout: typeof remote?.layout === 'string' ? remote.layout : fallback.layout,
    theme_tokens: themeTokens,
    palette,
    motion: (isRecord(remote?.motion) ? remote?.motion : fallback.motion) ?? {},
    soundscape: (isRecord(remote?.soundscape) ? remote?.soundscape : fallback.soundscape) ?? {},
    depth: remote?.depth ?? fallback.depth ?? null,
    font: typeof remote?.font === 'string' ? remote.font : fallback.font,
  }
}

function normaliseTheme(
  input: Partial<DesignContextResponse | DesignFeedbackResponse> & {
    design_dna?: RemoteDesignDNA | null
    evolution_stage?: string | null
    preferred_emotion?: string | null
    relational_signature?: Record<string, unknown> | null
  },
  previous?: NormalizedTheme,
): NormalizedTheme {
  const designDna = mergeDesignDNA(input.design_dna, previous?.design_dna ?? DEFAULT_DNA)
  return {
    design_dna: designDna,
    evolution_stage: input.evolution_stage ?? previous?.evolution_stage ?? DEFAULT_THEME.evolution_stage,
    preferred_emotion: input.preferred_emotion ?? previous?.preferred_emotion ?? DEFAULT_THEME.preferred_emotion,
    relational_signature: input.relational_signature ?? previous?.relational_signature ?? null,
  }
}

function loadCachedTheme(designProfile: UserDesignProfile | null): NormalizedTheme {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as NormalizedTheme
        if (parsed && isRecord(parsed.design_dna)) {
          return normaliseTheme(parsed as Partial<DesignContextResponse>, DEFAULT_THEME)
        }
      }
    } catch (error) {
      reportError('DesignThemeProvider.loadCachedTheme', error)
    }
  }

  if (designProfile?.design_dna) {
    return normaliseTheme(
      {
        design_dna: designProfile.design_dna as RemoteDesignDNA,
        evolution_stage: designProfile.evolution_stage,
        preferred_emotion: designProfile.preferred_emotion,
      },
      DEFAULT_THEME,
    )
  }

  return DEFAULT_THEME
}

function loadPendingTheme(): NormalizedTheme | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PENDING_THEME_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as NormalizedTheme
    if (parsed && isRecord(parsed.design_dna)) {
      return normaliseTheme(parsed as Partial<DesignContextResponse>, DEFAULT_THEME)
    }
  } catch (error) {
    reportError('DesignThemeProvider.loadPendingTheme', error)
  }
  return null
}

function applyCssVariables(theme: NormalizedTheme, resolvedTheme: ResolvedAdaptiveTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  window.requestAnimationFrame(() => {
    Object.entries(resolvedTheme.cssVariables).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(key, value)
      }
    })

    if (theme.evolution_stage) {
      root.dataset.evolutionStage = theme.evolution_stage
    } else {
      delete root.dataset.evolutionStage
    }

    if (theme.preferred_emotion) {
      root.dataset.preferredEmotion = theme.preferred_emotion
    } else {
      delete root.dataset.preferredEmotion
    }

    root.dataset.emotionQuadrant = resolvedTheme.emotion
  })
}

export function DesignThemeProvider({ children }: { children: ReactNode }) {
  const { session, status, user, designProfile, accountHydrated, refreshAccountData } = useAuth()
  const [theme, setTheme] = useState<NormalizedTheme>(() => loadCachedTheme(designProfile))
  const [loading, setLoading] = useState(false)
  const [pendingInteractions, setPendingInteractions] = useState<QueuedInteraction[]>([])
  const [bootstrappedFromProfile, setBootstrappedFromProfile] = useState(Boolean(designProfile?.design_dna))
  const [pendingTheme, setPendingTheme] = useState<NormalizedTheme | null>(() => loadPendingTheme())
  const [emotionSignal, setEmotionSignal] = useState<EmotionSignalInput | null>(() =>
    theme.preferred_emotion ? { label: theme.preferred_emotion } : null,
  )
  const [adaptiveEnabledState, setAdaptiveEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const stored = window.localStorage.getItem(ADAPTIVE_KEY)
    return stored !== 'false'
  })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const adaptiveEnabled = adaptiveEnabledState
  const emotionQuadrant = useMemo(
    () => deriveEmotionQuadrant(emotionSignal, theme.preferred_emotion, 'calm'),
    [emotionSignal, theme.preferred_emotion],
  )
  const resolvedTheme = useMemo(
    () => resolveAdaptiveTheme({ theme, emotion: emotionQuadrant, reducedMotion: prefersReducedMotion }),
    [emotionQuadrant, prefersReducedMotion, theme],
  )

  useLayoutEffect(() => {
    applyCssVariables(theme, resolvedTheme)
  }, [resolvedTheme, theme])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    setPrefersReducedMotion(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  useEffect(() => {
    if (!bootstrappedFromProfile && accountHydrated && designProfile?.design_dna) {
      const nextTheme = normaliseTheme(
        {
          design_dna: designProfile.design_dna as RemoteDesignDNA,
          evolution_stage: designProfile.evolution_stage,
          preferred_emotion: designProfile.preferred_emotion,
        },
        theme,
      )
      setTheme(nextTheme)
      setBootstrappedFromProfile(true)
    }
  }, [accountHydrated, bootstrappedFromProfile, designProfile?.design_dna, designProfile?.evolution_stage, designProfile?.preferred_emotion, theme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    } catch (error) {
      reportError('DesignThemeProvider.persistTheme', error)
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!pendingTheme) {
      window.localStorage.removeItem(PENDING_THEME_KEY)
      return
    }

    try {
      window.localStorage.setItem(PENDING_THEME_KEY, JSON.stringify(pendingTheme))
    } catch (error) {
      reportError('DesignThemeProvider.storePendingTheme', error)
    }
  }, [pendingTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ADAPTIVE_KEY, adaptiveEnabled ? 'true' : 'false')
  }, [adaptiveEnabled])

  useEffect(() => {
    if (adaptiveEnabled && pendingTheme) {
      setTheme(pendingTheme)
      setPendingTheme(null)
    }
  }, [adaptiveEnabled, pendingTheme])

  const persistTheme = useCallback(
    async (updater: (previous: NormalizedTheme) => NormalizedTheme) => {
      let computedTheme: NormalizedTheme = DEFAULT_THEME
      setTheme((previous) => {
        const nextTheme = updater(previous)
        computedTheme = nextTheme
        return adaptiveEnabled ? nextTheme : previous
      })

      if (!adaptiveEnabled) {
        setPendingTheme(computedTheme)
      } else if (pendingTheme) {
        setPendingTheme(null)
      }

      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(computedTheme))
        }
      } catch (error) {
        reportError('DesignThemeProvider.cacheTheme', error)
      }

      if (user?.id) {
        try {
          await saveUserDesignProfile(user.id, {
            design_dna: computedTheme.design_dna,
            evolution_stage: computedTheme.evolution_stage,
            preferred_emotion: computedTheme.preferred_emotion,
          })
          await refreshAccountData()
        } catch (error) {
          reportError('DesignThemeProvider.saveUserDesignProfile', error, { userId: user.id })
        }
      }

      return computedTheme
    },
    [adaptiveEnabled, pendingTheme, refreshAccountData, user?.id],
  )

  const setAdaptiveEnabled = useCallback(
    (enabled: boolean) => {
      setAdaptiveEnabledState(enabled)
      if (!enabled) {
        setPendingTheme(null)
      }
    },
    [],
  )

  const registerEmotionSignal = useCallback((signal: EmotionSignalInput | null) => {
    setEmotionSignal(signal)
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id || !session?.access_token) {
      setLoading(false)
      return
    }

    let active = true

    const hydrateTheme = async () => {
      setLoading(true)
      try {
        const remoteTheme = await getDesignTheme(user.id, session.access_token)
        if (!active) return
        await persistTheme((previous) => normaliseTheme(remoteTheme, previous))
        setBootstrappedFromProfile(true)
      } catch (error) {
        if (!active) return
        reportError('DesignThemeProvider.getDesignTheme', error, { userId: user.id })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    hydrateTheme()

    return () => {
      active = false
    }
  }, [persistTheme, session?.access_token, status, user?.id])

  const flushFeedback = useCallback(async () => {
    if (!session?.user?.id || !session.access_token) return

    let batch: QueuedInteraction[] = []
    setPendingInteractions((current) => {
      batch = current
      return []
    })

    if (!batch.length) return

    const actionType = batch.find((interaction) => interaction.actionType)?.actionType ?? 'interaction_batch'
    const relationshipContext = batch.find((interaction) => interaction.relationshipContext)?.relationshipContext

    const payload: DesignFeedbackPayload = {
      user_id: session.user.id,
      action_type: actionType,
      interactions: batch.map(({ metric, value, sentiment, targetId, metadata }) => ({
        metric,
        value,
        sentiment,
        target_id: targetId,
        metadata,
      })),
      ...(relationshipContext ? { relationship_context: relationshipContext } : {}),
    }

    try {
      const response = await postDesignFeedback(payload, session.access_token)
      if (response && response.status === 'mutated' && response.design_dna) {
        await persistTheme((previous) => normaliseTheme(response, previous))
      }
    } catch (error) {
      reportError(
        'DesignThemeProvider.flushFeedback',
        error,
        payload as unknown as Record<string, unknown>,
      )
    }
  }, [persistTheme, session?.access_token, session?.user?.id])

  useEffect(() => {
    if (!pendingInteractions.length) return
    const timer = window.setTimeout(() => {
      void flushFeedback()
    }, FEEDBACK_INTERVAL_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [flushFeedback, pendingInteractions])

  const submitEmotionContext = useCallback(
    async (input: Omit<DesignContextRequest, 'user_id'> & { user_id?: string }) => {
      if (!session?.user?.id || !session.access_token) return null

      const payload: DesignContextRequest = {
        user_id: input.user_id ?? session.user.id,
        emotion: input.emotion,
        intensity: input.intensity,
        confidence: input.confidence,
        user_state: input.user_state,
        ...(input.relationship_context ? { relationship_context: input.relationship_context } : {}),
      }

      try {
        const response = await postDesignContext(payload, session.access_token)
        registerEmotionSignal({ label: payload.emotion, intensity: payload.intensity, source: 'design_context' })
        const nextTheme = await persistTheme((previous) => normaliseTheme(response, previous))
        return nextTheme
      } catch (error) {
        reportError(
          'DesignThemeProvider.submitEmotionContext',
          error,
          payload as unknown as Record<string, unknown>,
        )
        return null
      }
    },
    [persistTheme, registerEmotionSignal, session?.access_token, session?.user?.id],
  )

  const registerInteraction = useCallback(
    (interaction: DesignInteractionInput) => {
      if (!interaction.metric || status !== 'authenticated' || !session?.user?.id) return
      setPendingInteractions((previous) => [...previous, { ...interaction, timestamp: Date.now() }])
    },
    [session?.user?.id, status],
  )

  const value = useMemo<DesignThemeContextValue>(
    () => ({
      theme,
      loading,
      adaptiveEnabled,
      emotionQuadrant,
      resolvedTheme,
      prefersReducedMotion,
      setAdaptiveEnabled,
      registerEmotionSignal,
      submitEmotionContext,
      registerInteraction,
      flushFeedback,
    }),
    [
      adaptiveEnabled,
      emotionQuadrant,
      flushFeedback,
      loading,
      prefersReducedMotion,
      registerEmotionSignal,
      registerInteraction,
      resolvedTheme,
      setAdaptiveEnabled,
      submitEmotionContext,
      theme,
    ],
  )

  return <DesignThemeContext.Provider value={value}>{children}</DesignThemeContext.Provider>
}

export type { NormalizedTheme } from '@/lib/theme/types'
export type { EmotionQuadrant } from '@/lib/theme/tokens'
export type { EmotionSignalInput } from '@/lib/theme/emotion'
export type { ResolvedAdaptiveTheme } from '@/lib/theme/resolver'

export function useDesignTheme() {
  const context = useContext(DesignThemeContext)
  if (!context) {
    throw new Error('useDesignTheme must be used within a DesignThemeProvider')
  }
  return context
}
