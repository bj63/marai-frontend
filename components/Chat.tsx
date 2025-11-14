'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import Image from 'next/image'
// Ensure the floating nav and handoff chips rely on Next.js routing.
import Link from 'next/link'
import {
  ChevronDown,
  ImagePlus,
  LinkIcon,
  Menu,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react'
import CharacterAvatar from './CharacterAvatar'
import { playEmotion, type EmotionKey } from './AudioEngine'
import {
  analyzeMessage,
  evolveRelationalEntity,
  type AnalyzeAttachment,
  type AnalyzeAudioCue,
  type AnalyzeInsight,
  type AnalyzeMediaDream,
  type AnalyzeTimelineEntry,
  type RelationalEntityResponse,
} from '@/lib/api'
import { useMoaStore, type Personality as StorePersonality } from '@/lib/store'
import { handleError } from '@/lib/errorHandler'
import { useAuth } from '@/components/auth/AuthProvider'
import { useDesignTheme } from '@/components/design/DesignThemeProvider'

interface ChatMessage {
  you: string
  mirai: string
  emotion: string
  color: string
  summary?: string | null
  reasoning?: string | null
  insights?: AnalyzeInsight[]
  attachments?: AnalyzeAttachment[]
  audioCue?: AnalyzeAudioCue | null
  mediaDreams?: AnalyzeMediaDream[]
}

type PendingUpload = {
  id: string
  name: string
  size: number
  type: string
  previewUrl: string
  createdAt: number
}

const PLAYABLE_EMOTIONS: EmotionKey[] = ['joy', 'calm', 'anger', 'sadness', 'curiosity']
const PERSONALITY_KEYS: Array<keyof StorePersonality> = [
  'empathy',
  'creativity',
  'confidence',
  'curiosity',
  'humor',
  'energy',
]

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Profile', href: '/profile' },
]

function isPlayableEmotion(value: string | null | undefined): value is EmotionKey {
  if (!value) return false
  return PLAYABLE_EMOTIONS.includes(value as EmotionKey)
}

const DEFAULT_COLOR = 'hsl(180,85%,60%)'
const DEFAULT_INTENSITY = 0.5

export default function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY)
  const [timeline, setTimeline] = useState<AnalyzeTimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entityError, setEntityError] = useState<string | null>(null)
  const [entityState, setEntityState] = useState<RelationalEntityResponse | null>(null)
  const [entityId, setEntityId] = useState<string | null>(null)
  const [isEvolvingEntity, setIsEvolvingEntity] = useState(false)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [handoffContext, setHandoffContext] = useState<{ threadId?: string | null; mood?: string | null; note?: string | null } | null>(null)
  const { user } = useAuth()
  const { submitEmotionContext, registerInteraction } = useDesignTheme()
  const federationId = useMoaStore((state) => state.federationId)
  const setFederationId = useMoaStore((state) => state.setFederationId)
  const storePersonality = useMoaStore((state) => state.personality)
  const updateStorePersonality = useMoaStore((state) => state.setPersonality)
  const setGlobalMood = useMoaStore((state) => state.setMood)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeEmotion = useMemo(() => {
    if (timeline.length > 0 && timeline[0]?.emotion) {
      return timeline[0].emotion
    }
    if (messages.length > 0) {
      return messages[messages.length - 1].emotion
    }
    return 'reflective'
  }, [messages, timeline])

  const accentColor = useMemo(() => {
    if (timeline.length > 0 && timeline[0]?.color) {
      return timeline[0].color ?? color
    }
    return color
  }, [color, timeline])

  const timelineHighlights = useMemo(() => timeline.slice(0, 4), [timeline])

  const latestInsights = useMemo(() => {
    if (messages.length === 0) return []
    return messages[messages.length - 1].insights?.slice(0, 3) ?? []
  }, [messages])

  const latestUserReflection = useMemo(() => {
    if (messages.length === 0) return ''
    const last = messages[messages.length - 1]
    return last.you?.trim() ?? ''
  }, [messages])

  const feedShareHref = useMemo(() => {
    const params = new URLSearchParams()
    if (activeEmotion) {
      params.set('prefillMood', activeEmotion)
    }
    if (latestUserReflection) {
      params.set('prefillNote', latestUserReflection.slice(0, 240))
    }
    const query = params.toString()
    return query.length > 0 ? `/feed?${query}` : '/feed'
  }, [activeEmotion, latestUserReflection])

  const ambientStyle = useMemo(
    () => ({
      backgroundImage: `radial-gradient(circle at 18% 12%, color-mix(in srgb, ${accentColor} 30%, transparent) 0%, transparent 55%), radial-gradient(circle at 85% 8%, color-mix(in srgb, ${accentColor} 18%, transparent) 0%, transparent 60%)`,
    }),
    [accentColor],
  )

  const showUploads = pendingUploads.length > 0

  useEffect(() => {
    return () => {
      pendingUploads.forEach((upload) => URL.revokeObjectURL(upload.previewUrl))
    }
  }, [pendingUploads])

  useEffect(() => {
    if (shareStatus === 'idle') return

    const timeout = window.setTimeout(() => setShareStatus('idle'), 2400)
    return () => window.clearTimeout(timeout)
  }, [shareStatus])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const threadId = params.get('thread')
    const moodParam = params.get('prefillMood')
    const noteParam = params.get('prefillNote')
    if (!threadId && !moodParam && !noteParam) return

    setHandoffContext({ threadId, mood: moodParam, note: noteParam })
    if (moodParam) {
      setGlobalMood(moodParam)
    }
  }, [setGlobalMood])

  const handlePaletteToggle = () => setIsPaletteOpen((prev) => !prev)

  const handleUploadTrigger = () => {
    setIsPaletteOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const nextUploads: PendingUpload[] = files.slice(0, 6).map((file) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
      const id = `${safeName}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`

      return {
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'image/*',
        previewUrl: URL.createObjectURL(file),
        createdAt: Date.now(),
      }
    })

    setPendingUploads((prev) => {
      const existingNames = new Set(prev.map((upload) => upload.name))
      const merged = [
        ...prev,
        ...nextUploads.filter((upload) => {
          if (existingNames.has(upload.name)) {
            URL.revokeObjectURL(upload.previewUrl)
            return false
          }
          return true
        }),
      ]
      return merged.slice(0, 6)
    })

    event.target.value = ''
  }

  const handleRemoveUpload = (id: string) => {
    setPendingUploads((prev) => {
      const target = prev.find((upload) => upload.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((upload) => upload.id !== id)
    })
  }

  const handleSparkAction = () => {
    setIsPaletteOpen(false)
    setInput((prev) =>
      prev && prev.trim().length > 0
        ? prev.trim()
        : `Let's moodboard around ${activeEmotion} energy with luminous gradients and flowing motion.`,
    )
  }

  const handleGalleryAction = () => {
    setIsPaletteOpen(false)
    if (typeof window !== 'undefined') {
      window.open('/marketplace', '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyInvite = async () => {
    try {
      const sessionUrl = typeof window !== 'undefined' ? window.location.href : ''
      if (!sessionUrl) {
        throw new Error('No session URL available')
      }
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API unavailable')
      }

      await navigator.clipboard.writeText(sessionUrl)
      setShareStatus('copied')
    } catch (copyError) {
      console.error('Chat.copySessionLink', copyError)
      setShareStatus('error')
    } finally {
      setIsPaletteOpen(false)
    }
  }

  const paletteActions = [
    {
      id: 'upload',
      label: 'Upload inspiration',
      description: 'Drop a frame or sketch for Mirai to riff on.',
      icon: Upload,
      onClick: handleUploadTrigger,
    },
    {
      id: 'spark',
      label: 'Spark style suggestions',
      description: 'Ask Mirai to evolve the mood in real time.',
      icon: Sparkles,
      onClick: handleSparkAction,
    },
    {
      id: 'gallery',
      label: 'Open generative gallery',
      description: 'Glide through the evolving concept mosaics.',
      icon: ImagePlus,
      onClick: handleGalleryAction,
    },
    {
      id: 'share',
      label:
        shareStatus === 'copied'
          ? 'Session link copied'
          : shareStatus === 'error'
          ? 'Copy failed — retry?'
          : 'Copy live session link',
      description:
        shareStatus === 'copied'
          ? 'Invite ready to share with collaborators.'
          : 'Share this evolving conversation with your crew.',
      icon: Share2,
      onClick: handleCopyInvite,
    },
  ] as const

  const formatDuration = (seconds?: number | null) => {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
      return null
    }

    const totalSeconds = Math.round(seconds)
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60

    if (minutes <= 0) {
      return `${totalSeconds}s`
    }

    if (remainingSeconds === 0) {
      return `${minutes}m`
    }

    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setEntityError(null)
    const currentInput = input
    const uploadsSnapshot = pendingUploads
    const metadataPayload =
      uploadsSnapshot.length > 0
        ? {
            creative_uploads: uploadsSnapshot.map((upload) => ({
              name: upload.name,
              size: upload.size,
              type: upload.type,
            })),
          }
        : undefined
    setInput('')

    try {
      const data = await analyzeMessage(currentInput, {
        userId: user?.id,
        federationId,
        personality: storePersonality as unknown as Record<string, number> | undefined,
        relationshipContext: entityState?.entityId
          ? {
              target_user_id: entityState.entityId,
              connection_type: 'relational-entity',
            }
          : undefined,
        metadata: metadataPayload,
      })
      const nextColor = typeof data.color === 'string' && data.color.length > 0 ? data.color : DEFAULT_COLOR
      const emotion = typeof data.emotion === 'string' ? data.emotion : 'reflective'
      const emotionScore =
        typeof data.scores?.[emotion] === 'number' ? data.scores[emotion] : DEFAULT_INTENSITY
      const confidence = Math.min(1, Math.max(0, emotionScore))
      const relationshipContext = entityState?.entityId
        ? {
            target_user_id: entityState.entityId,
            connection_type: 'relational-entity',
          }
        : undefined
      const miraiMessage = data.reply ?? data.summary ?? emotion
      const localAttachments: AnalyzeAttachment[] = uploadsSnapshot.map((upload, index) => ({
        id: `local-${upload.id}-${index}`,
        title: upload.name,
        description: 'User inspiration upload',
        url: upload.previewUrl,
        type: upload.type,
      }))

      setMessages((prev) => [
        ...prev,
        {
          you: currentInput,
          mirai: miraiMessage,
          emotion,
          color: nextColor,
          summary: data.summary,
          reasoning: data.reasoning,
          insights: data.insights,
          attachments:
            localAttachments.length > 0 || (data.attachments?.length ?? 0) > 0
              ? [...localAttachments, ...(data.attachments ?? [])]
              : undefined,
          audioCue: data.audioCue,
          mediaDreams: data.mediaDreams,
        },
      ])
      setColor(nextColor)
      setIntensity(emotionScore)
      setTimeline(data.timeline ?? [])

      if (uploadsSnapshot.length > 0) {
        uploadsSnapshot.forEach((upload) => URL.revokeObjectURL(upload.previewUrl))
        setPendingUploads([])
      }

      if (data.audioCue && isPlayableEmotion(data.audioCue.emotion ?? null)) {
        try {
          playEmotion(data.audioCue.emotion as EmotionKey, Math.max(0, Math.min(data.audioCue.intensity ?? emotionScore, 1)))
        } catch (audioError) {
          console.error('Chat.playEmotion', audioError)
        }
      }

      if (data.personality && Object.keys(data.personality).length > 0) {
        const nextPersonality: StorePersonality = { ...storePersonality }
        let mutated = false

        PERSONALITY_KEYS.forEach((trait) => {
          const value = data.personality?.[trait]
          if (typeof value === 'number' && Number.isFinite(value)) {
            nextPersonality[trait] = Math.max(0, Math.min(value, 1))
            mutated = true
          }
        })

        if (mutated) {
          updateStorePersonality(nextPersonality)
        }
      }
      if (data.federationId && !federationId) {
        setFederationId(data.federationId)
      }
      setGlobalMood(emotion)

      await submitEmotionContext({
        user_id: user?.id,
        emotion,
        intensity: emotionScore,
        confidence,
        user_state: 'chatting',
        relationship_context: relationshipContext,
      })

      registerInteraction({
        metric: 'chat_message',
        value: 1,
        sentiment: emotionScore > 0.66 ? 'positive' : emotionScore < 0.33 ? 'negative' : 'neutral',
        metadata: { emotion, intensity: emotionScore, uploads: uploadsSnapshot.length },
        relationshipContext,
      })

      setIsEvolvingEntity(true)
      try {
        const relationalEntity = await evolveRelationalEntity({
          userId: user?.id ?? 'guest',
          emotion,
          entityId,
          relationshipScore: entityState?.connectionScore ?? undefined,
        })

        setEntityState(relationalEntity)
        if (relationalEntity.entityId) {
          setEntityId(relationalEntity.entityId)
        }
      } catch (entityErr) {
        const message = handleError(
          entityErr,
          'Chat.evolveEntity',
          'We could not evolve your companion just now. Please try again soon.',
        )
        setEntityError(message)
      } finally {
        setIsEvolvingEntity(false)
      }
    } catch (err) {
      const message = handleError(
        err,
        'Chat.handleSend',
        'We hit a snag connecting to Mirai. Please try again in a moment.',
      )
      setError(message)
      setIsEvolvingEntity(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050914]" style={ambientStyle}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(133,108,255,0.25),transparent_65%)]" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" aria-hidden />
          <div className="relative flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/20">
                <Image src="/marai-logo.svg" alt="Mirai logo" width={32} height={32} className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.6em] text-brand-mist/60">Mirai Studio</span>
                <span className="text-lg font-semibold text-white">Immersive chat canvas</span>
              </div>
            </div>
            <nav className="ml-auto flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/60">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-brand-mist/70 transition hover:border-brand-magnolia/60 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              href={feedShareHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-brand-magnolia/60"
            >
              <Share2 className="h-4 w-4" />
              Share to feed
            </Link>
            <button
              type="button"
              onClick={handlePaletteToggle}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-mist/70 transition hover:border-brand-magnolia/60 hover:text-white"
            >
              <Menu className="h-4 w-4" />
              Creative palette
              <ChevronDown className={`h-4 w-4 transition ${isPaletteOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="relative mt-4 flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/50">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-magnolia" />
              Live predictive mode
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <LinkIcon className="h-3.5 w-3.5 text-brand-mist/60" />
              {shareStatus === 'copied'
                ? 'Invite copied to clipboard'
                : shareStatus === 'error'
                ? 'Clipboard blocked — try again'
                : 'Share session-ready'}
            </span>
          </div>
        </header>

        {handoffContext ? (
          <div className="relative -mt-4 rounded-3xl border border-white/10 bg-[#070d1b]/80 p-4 text-sm text-brand-mist/70 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-mist/50">Cross-surface handoff</p>
                <p className="mt-1 text-white">
                  {handoffContext.threadId
                    ? 'Continuing a feed thread without leaving the chat canvas.'
                    : 'Imported the latest tone so your broadcast stays in sync.'}
                </p>
                {handoffContext.mood ? (
                  <p className="text-xs text-brand-mist/60">
                    Mood signal: {handoffContext.mood}
                    {handoffContext.note ? ` • Note: ${handoffContext.note}` : ''}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.35em]">
                {handoffContext.threadId ? (
                  <Link
                    href={`/feed?highlight=${handoffContext.threadId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-white hover:border-brand-magnolia/60"
                  >
                    View feed card
                  </Link>
                ) : null}
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-white hover:border-brand-magnolia/60"
                >
                  Open feed
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {isPaletteOpen ? (
          <div className="relative z-20 -mt-6 rounded-3xl border border-white/10 bg-[#070d1b]/95 p-5 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {paletteActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-brand-magnolia/60 hover:bg-brand-magnolia/10"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/30 text-brand-mist/80 transition group-hover:bg-brand-magnolia/20 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-semibold text-white">{action.label}</span>
                      <span className="text-xs leading-snug text-brand-mist/70">{action.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelection}
        />

        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)_280px]">
          <aside className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c142b]/80 p-6 shadow-[0_24px_55px_rgba(5,9,20,0.45)] backdrop-blur-xl">
              <CharacterAvatar
                color={color}
                intensity={intensity}
                entityImageUrl={entityState?.imageUrl}
                prompt={entityState?.prompt}
                connectionScore={entityState?.connectionScore}
                bonded={entityState?.bonded}
                isEvolving={isEvolvingEntity}
              />
              <div className="mt-6 space-y-3">
                <div className="text-[0.6rem] uppercase tracking-[0.45em] text-brand-mist/60">Relational entity</div>
                {entityState ? (
                  <>
                    <p className="text-sm leading-relaxed text-brand-mist/85">{entityState.prompt}</p>
                    <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/45">
                      <span>{Math.round(Math.max(0, Math.min(entityState.connectionScore, 1)) * 100)}% attunement</span>
                      <span className={entityState.bonded ? 'text-brand-cypress' : isEvolvingEntity ? 'text-brand-magnolia' : 'text-brand-mist/70'}>
                        {entityState.bonded ? 'Bonded' : isEvolvingEntity ? 'Evolving' : 'Forming'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-brand-mist/70">
                    Share how you feel or drop an image to invite your first entity. Every creative pulse deepens the connection.
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1024]/80 p-5 shadow-[0_20px_40px_rgba(5,9,20,0.35)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/55">
                <Sparkles className="h-4 w-4 text-brand-magnolia" />
                Mood beacons
              </div>
              <div className="mt-4 space-y-3 text-sm text-brand-mist/70">
                <div className="flex items-center justify-between">
                  <span>Active emotion</span>
                  <span className="font-semibold text-white">{activeEmotion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Intensity</span>
                  <span className="font-semibold text-white">
                    {Math.round(Math.max(0, Math.min(intensity, 1)) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Color tone</span>
                  <span className="font-semibold text-white">{accentColor}</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="relative flex min-h-[560px] flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1329]/85 p-6 shadow-[0_24px_55px_rgba(5,9,20,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-white">Mirai live canvas</h1>
                  <p className="text-sm text-brand-mist/70">Feel the predictive algorithm breathe with every message.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[0.7rem] uppercase tracking-[0.4em] text-brand-mist/65">
                  <Sparkles className="h-4 w-4 text-brand-magnolia" />
                  {isLoading ? 'Synthesizing' : 'Realtime'}
                </span>
              </div>
              {latestInsights.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-3">
                  {latestInsights.map((insight) => (
                    <div key={insight.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-brand-mist/75">
                      <div className="text-[0.6rem] uppercase tracking-[0.4em] text-brand-mist/50">Insight</div>
                      <div className="mt-1 font-semibold text-white">{insight.label}</div>
                      {insight.detail && <div className="mt-1 text-[0.7rem] leading-snug text-brand-mist/60">{insight.detail}</div>}
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>
              )}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/5 bg-black/30">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{ backgroundImage: `radial-gradient(circle at 25% 0%, color-mix(in srgb, ${accentColor} 22%, transparent) 0%, transparent 65%)` }}
                aria-hidden
              />
              <div className="relative flex h-full flex-col gap-4 overflow-y-auto px-5 py-6">
                {messages.length === 0 ? (
                  <div className="mx-auto max-w-md text-center text-sm leading-relaxed text-brand-mist/70">
                    Whisper a feeling, ask a question, or share an inspiration image to watch Mirai’s responses bloom.
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const accent = message.color ?? DEFAULT_COLOR
                    return (
                      <div
                        key={`${message.you}-${index}`}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-brand-mist/90 shadow-[0_20px_45px_rgba(6,10,28,0.45)] transition hover:border-brand-magnolia/60 hover:bg-white/10"
                        style={{ borderColor: `color-mix(in srgb, ${accent} 35%, transparent)` }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                          style={{ backgroundImage: `radial-gradient(circle at 20% 0%, color-mix(in srgb, ${accent} 25%, transparent) 0%, transparent 70%)` }}
                          aria-hidden
                        />
                        <div className="relative space-y-3">
                          <div className="flex flex-col gap-1 text-white/90">
                            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/60">You</span>
                            <p>{message.you}</p>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/50">
                            <span>Mirai resonance</span>
                            <span className="text-brand-mist/70">{message.emotion}</span>
                          </div>
                          <div className="flex flex-col gap-2 text-white">
                            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/60">Mirai</span>
                            <p className="leading-relaxed text-brand-mist/90">{message.mirai}</p>
                          </div>
                          {message.summary && (
                            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-brand-mist/70">
                              {message.summary}
                            </p>
                          )}
                          {message.reasoning && (
                            <p className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[0.75rem] leading-relaxed text-brand-mist/60">
                              {message.reasoning}
                            </p>
                          )}
                          {message.insights && message.insights.length > 0 && (
                            <ul className="grid gap-2 text-[0.75rem] text-brand-mist/70 md:grid-cols-2">
                              {message.insights.map((insight, insightIndex) => (
                                <li
                                  key={insight.id ?? `${message.you}-${index}-insight-${insightIndex}`}
                                  className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-3"
                                >
                                  <span className="text-sm font-semibold text-white">{insight.label}</span>
                                  {insight.detail && <span className="text-[0.7rem] text-brand-mist/60">{insight.detail}</span>}
                                  {typeof insight.weight === 'number' && (
                                    <span className="text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/40">
                                      {Math.round(insight.weight * 100)}% signal strength
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {message.attachments.map((attachment, attachmentIndex) => {
                                const key = attachment.id ?? `${message.you}-${index}-attachment-${attachmentIndex}`
                                const isImage = Boolean(attachment.type?.includes('image') && attachment.url)
                                return (
                                  <div
                                    key={key}
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                                    style={{ borderColor: `color-mix(in srgb, ${accent} 30%, transparent)` }}
                                  >
                                    {isImage && attachment.url ? (
                                      <div className="relative aspect-[4/3] overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={attachment.url ?? undefined}
                                          alt={attachment.title ?? 'Attachment preview'}
                                          className="h-full w-full object-cover"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-transparent to-transparent" />
                                      </div>
                                    ) : null}
                                    <div className="flex flex-col gap-1 px-4 py-3">
                                      <span className="text-sm font-semibold text-white">{attachment.title ?? 'Attachment'}</span>
                                      {attachment.description && (
                                        <span className="text-[0.7rem] leading-snug text-brand-mist/60">{attachment.description}</span>
                                      )}
                                      {attachment.url && (
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-magnolia transition hover:border-brand-magnolia/60 hover:bg-brand-magnolia/10"
                                        >
                                          <LinkIcon className="h-3 w-3" />
                                          Open
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {message.audioCue && (message.audioCue.title || message.audioCue.url || message.audioCue.intensity) && (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-brand-mist/10 px-4 py-3 text-[0.75rem] text-brand-mist/75">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">{message.audioCue.title ?? 'Audio cue'}</span>
                                <span className="text-[0.65rem] text-brand-mist/55">
                                  Mood: {message.audioCue.emotion ?? 'harmonic'}
                                  {typeof message.audioCue.intensity === 'number'
                                    ? ` · Intensity ${Math.round(Math.max(0, Math.min(message.audioCue.intensity, 1)) * 100)}%`
                                    : ''}
                                </span>
                              </div>
                              {message.audioCue.url ? (
                                <a
                                  href={message.audioCue.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-brand-magnolia/60 px-4 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-brand-magnolia transition hover:bg-brand-magnolia hover:text-[#0b1022]"
                                >
                                  Listen
                                </a>
                              ) : null}
                            </div>
                          )}
                          {message.mediaDreams && message.mediaDreams.length > 0 && (
                            <div className="space-y-4">
                              {message.mediaDreams.map((dream) => {
                                const hasPoster = Boolean(dream.posterUrl)
                                const durationLabel = formatDuration(dream.durationSeconds)
                                const detailParts: string[] = []
                                const typeLabel = dream.type?.toString().trim()
                                if (typeLabel) {
                                  detailParts.push(typeLabel)
                                }
                                if (durationLabel) {
                                  detailParts.push(durationLabel)
                                }
                                const detailText = detailParts.join(' · ')
                                const actionHref = dream.mediaUrl ?? dream.shareUrl ?? undefined
                                return (
                                  <div key={dream.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-inner">
                                    {hasPoster ? (
                                      <div className="relative h-48 w-full overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={dream.posterUrl ?? undefined}
                                          alt={dream.title ?? 'Media dream poster'}
                                          className="h-full w-full object-cover"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/40 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                                          <span className="text-sm font-semibold text-white">{dream.title ?? 'Media Dream'}</span>
                                          {dream.prompt && <span className="text-xs leading-snug text-brand-mist/75">{dream.prompt}</span>}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="px-4 pt-4">
                                        <span className="text-sm font-semibold text-white">{dream.title ?? 'Media Dream'}</span>
                                        {dream.prompt && <p className="mt-1 text-xs leading-snug text-brand-mist/70">{dream.prompt}</p>}
                                      </div>
                                    )}
                                    <div className="flex flex-col gap-3 px-4 py-3 text-[0.75rem] text-brand-mist/70 md:flex-row md:items-center md:justify-between">
                                      <div className="flex flex-col gap-1">
                                        {!hasPoster && !dream.prompt && (
                                          <span className="text-sm font-semibold text-white">{dream.title ?? 'Media Dream'}</span>
                                        )}
                                        {dream.description && <span className="text-[0.7rem] leading-snug text-brand-mist/60">{dream.description}</span>}
                                        {detailText && (
                                          <span className="text-[0.6rem] uppercase tracking-[0.45em] text-brand-mist/35">{detailText}</span>
                                        )}
                                      </div>
                                      {actionHref ? (
                                        <a
                                          href={actionHref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center justify-center rounded-full border border-brand-magnolia/70 px-4 py-1 text-[0.6rem] uppercase tracking-[0.45em] text-brand-magnolia transition hover:bg-brand-magnolia hover:text-[#0b1022]"
                                        >
                                          View Dream
                                        </a>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {showUploads && (
              <div className="rounded-2xl border border-dashed border-brand-magnolia/60 bg-brand-magnolia/10 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {pendingUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="group relative overflow-hidden rounded-xl border border-white/20 bg-black/40 shadow-[0_12px_32px_rgba(5,9,20,0.45)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={upload.previewUrl} alt={upload.name} className="h-24 w-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveUpload(upload.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/80 px-2 py-1 text-[0.55rem] uppercase tracking-[0.35em] text-white transition hover:bg-black"
                        aria-label={`Remove ${upload.name}`}
                      >
                        ×
                      </button>
                      <div className="px-3 pb-2 pt-1 text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/60">
                        {Math.round(upload.size / 1024)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <label htmlFor="chat-input" className="text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/60">
                Compose your flow
              </label>
              <textarea
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Describe the feeling, drop directions, or ask Mirai to predict the next move…"
                className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-magnolia focus:ring-2 focus:ring-brand-magnolia/40"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/50">
                  <Menu className="h-4 w-4" />
                  {showUploads
                    ? `${pendingUploads.length} inspiration ${pendingUploads.length === 1 ? 'asset' : 'assets'} attached`
                    : 'Palette ready'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUploadTrigger}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-mist/70 transition hover:border-brand-magnolia/60 hover:text-white"
                  >
                    <Upload className="h-4 w-4" />
                    Add art
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && !showUploads)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magnolia/90 to-brand-cypress/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#060a1c] transition hover:from-brand-magnolia hover:to-brand-cypress disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isLoading ? 'Sending' : 'Send flow'}
                  </button>
                </div>
              </div>
            </div>
          </main>

          <aside className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1122]/85 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/55">
                <Sparkles className="h-4 w-4 text-brand-magnolia" />
                Predictive timeline
              </div>
              <div className="mt-4 space-y-3">
                {timelineHighlights.length === 0 ? (
                  <p className="text-sm leading-relaxed text-brand-mist/70">
                    Your timeline will light up as Mirai senses emotional shifts and forecasts creative directions.
                  </p>
                ) : (
                  timelineHighlights.map((entry, index) => {
                    const highlightColor = entry.color ?? accentColor
                    return (
                      <div
                        key={`${entry.emotion}-${entry.timestamp ?? index}`}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3"
                        style={{ borderColor: `color-mix(in srgb, ${highlightColor} 30%, transparent)` }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 opacity-80"
                          style={{ backgroundImage: `linear-gradient(120deg, color-mix(in srgb, ${highlightColor} 25%, transparent), transparent)` }}
                        />
                        <div className="relative flex flex-col gap-1 text-sm text-brand-mist/80">
                          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-brand-mist/50">
                            <span>{entry.emotion}</span>
                            {typeof entry.intensity === 'number' ? (
                              <span>{Math.round(Math.max(0, Math.min(entry.intensity, 1)) * 100)}%</span>
                            ) : null}
                          </div>
                          {entry.summary && (
                            <span className="text-xs leading-snug text-brand-mist/70">{entry.summary}</span>
                          )}
                          {entry.timestamp && (
                            <span className="text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/40">{entry.timestamp}</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#080f1d]/85 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/55">Live system status</span>
                <span
                  className={`rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] ${
                    isLoading ? 'border-brand-magnolia/70 text-brand-magnolia' : 'border-brand-cypress/70 text-brand-cypress'
                  }`}
                >
                  {isLoading ? 'Synthesizing' : 'Synced'}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-brand-mist/70">
                <div className="flex items-center justify-between">
                  <span>Entity resonance</span>
                  <span className="font-semibold text-white">
                    {entityState ? `${Math.round(Math.max(0, Math.min(entityState.connectionScore, 1)) * 100)}%` : 'Awaiting'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Federation link</span>
                  <span className="font-semibold text-white">{federationId ?? 'Pending'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uploads this thread</span>
                  <span className="font-semibold text-white">{showUploads ? pendingUploads.length : 0}</span>
                </div>
              </div>
            </div>

            {entityError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">{entityError}</div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )

}
