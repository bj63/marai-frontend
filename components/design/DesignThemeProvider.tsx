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

export type NormalizedTheme = {
  design_dna: DesignDNA
  evolution_stage: string | null
  preferred_emotion: string | null
  relational_signature?: Record<string, unknown> | null
}

type DesignThemeContextValue = {
  theme: NormalizedTheme
  loading: boolean
  adaptiveEnabled: boolean
  setAdaptiveEnabled: (enabled: boolean) => void
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
          return normaliseTheme(parsed, DEFAULT_THEME)
        }
      }
    } catch (error) {
      reportError('DesignThemeProvider.loadCachedTheme', error)
    }
  }

  if (designProfile?.design_dna) {
    return normaliseTheme(
      {
        design_dna: designProfile.design_dna,
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
      return normaliseTheme(parsed, DEFAULT_THEME)
    }
  } catch (error) {
    reportError('DesignThemeProvider.loadPendingTheme', error)
  }
  return null
}

function applyCssVariables(theme: NormalizedTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const palette = theme.design_dna.palette
  const tokens = theme.design_dna.theme_tokens

  const updates: Record<string, string> = {
    '--design-primary': palette.primary ?? DEFAULT_DNA.palette.primary,
    '--design-accent': palette.accent ?? DEFAULT_DNA.palette.accent,
    '--design-background': palette.background ?? DEFAULT_DNA.palette.background,
    '--design-neutral': palette.neutral ?? DEFAULT_DNA.palette.neutral,
    '--design-surface': tokens.surface ?? DEFAULT_DNA.theme_tokens.surface,
    '--design-stroke': tokens.stroke ?? DEFAULT_DNA.theme_tokens.stroke,
  }

  if (theme.design_dna.font) {
    updates['--design-font-family'] = theme.design_dna.font
  }

  window.requestAnimationFrame(() => {
    Object.entries(updates).forEach(([key, value]) => {
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
  })
}

export function DesignThemeProvider({ children }: { children: ReactNode }) {
  const { session, status, user, designProfile, accountHydrated, refreshAccountData } = useAuth()
  const [theme, setTheme] = useState<NormalizedTheme>(() => loadCachedTheme(designProfile))
  const [loading, setLoading] = useState(false)
  const [pendingInteractions, setPendingInteractions] = useState<QueuedInteraction[]>([])
  const [bootstrappedFromProfile, setBootstrappedFromProfile] = useState(Boolean(designProfile?.design_dna))
  const [pendingTheme, setPendingTheme] = useState<NormalizedTheme | null>(() => loadPendingTheme())
  const [adaptiveEnabledState, setAdaptiveEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const stored = window.localStorage.getItem(ADAPTIVE_KEY)
    return stored !== 'false'
  })

  const adaptiveEnabled = adaptiveEnabledState

  useLayoutEffect(() => {
    applyCssVariables(theme)
  }, [theme])

  useEffect(() => {
    if (!bootstrappedFromProfile && accountHydrated && designProfile?.design_dna) {
      const nextTheme = normaliseTheme(
        {
          design_dna: designProfile.design_dna,
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
        return nextTheme
      })

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
    [refreshAccountData, user?.id],
  )

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
        const nextTheme = normaliseTheme(response, theme)
        await persistTheme(nextTheme)
      }
    } catch (error) {
      reportError('DesignThemeProvider.flushFeedback', error, payload)
    }
  }, [persistTheme, session?.access_token, session?.user?.id])
  }, [persistTheme, session?.access_token, session?.user?.id, theme])

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
        const nextTheme = await persistTheme((previous) => normaliseTheme(response, previous))
        return nextTheme
      } catch (error) {
        reportError('DesignThemeProvider.submitEmotionContext', error, payload)
        return null
      }
    },
    [persistTheme, session?.access_token, session?.user?.id],
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
      setAdaptiveEnabled,
      submitEmotionContext,
      registerInteraction,
      flushFeedback,
    }),
    [adaptiveEnabled, flushFeedback, loading, registerInteraction, setAdaptiveEnabled, submitEmotionContext, theme],
    [flushFeedback, loading, registerInteraction, submitEmotionContext, theme],
  )

  return <DesignThemeContext.Provider value={value}>{children}</DesignThemeContext.Provider>
}

export function useDesignTheme() {
  const context = useContext(DesignThemeContext)
  if (!context) {
    throw new Error('useDesignTheme must be used within a DesignThemeProvider')
  }
  return context
}
