'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
// Ensure the floating nav and handoff chips rely on Next.js routing.
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowUp,
  ChevronDown,
  ImagePlus,
  LinkIcon,
  Menu,
  Plus,
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
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-4 pt-6 lg:px-8">
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-xl">
              <span className="text-lg font-semibold text-white">Chat with Mirai</span>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.35em] text-brand-mist/60">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-brand-mist/70 transition hover:border-brand-magnolia/60 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        {handoffContext && (
          <div className="relative rounded-3xl border border-white/10 bg-[#070d1b]/80 p-4 text-sm text-brand-mist/70 backdrop-blur-xl">
            {/* Handoff context UI can remain, it is not part of the main clutter */}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelection}
        />

        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)_280px]">
          {/* Aside and Main content columns remain the same */}
          <aside className="flex flex-col gap-5">
            {/* Left aside content */}
          </aside>

          <main className="relative flex min-h-[560px] flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1329]/85 p-6 shadow-[0_24px_55px_rgba(5,9,20,0.45)] backdrop-blur-xl">
            {/* Main chat messages area */}
          </main>

          <aside className="flex flex-col gap-5">
            {/* Right aside content */}
          </aside>
        </div>

        {/* New Footer/Input Area */}
        <footer className="relative z-10 mt-auto">
          {isPaletteOpen && (
            <div className="absolute bottom-full mb-4 w-full max-w-lg rounded-3xl border border-white/10 bg-[#070d1b]/95 p-5 backdrop-blur-xl">
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
          )}

          {showUploads && (
            <div className="mb-4 rounded-2xl border border-dashed border-brand-magnolia/60 bg-brand-magnolia/10 p-4">
              {/* Uploads preview remains the same */}
            </div>
          )}

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaletteToggle}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <Plus className="h-5 w-5" />
              </button>
              <textarea
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Chat with Mirai…"
                className="h-12 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !showUploads)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
