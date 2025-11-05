'use client'

import { useState } from 'react'
import { useAddress } from '@thirdweb-dev/react'
import CharacterAvatar from './CharacterAvatar'
import TimelineCard from './TimelineCard'
import { playEmotion, type EmotionKey } from './AudioEngine'
import {
  analyzeMessage,
  evolveRelationalEntity,
  type AnalyzeAttachment,
  type AnalyzeAudioCue,
  type AnalyzeInsight,
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
  const { user } = useAuth()
  const { submitEmotionContext, registerInteraction } = useDesignTheme()
  const walletAddress = useAddress()
  const federationId = useMoaStore((state) => state.federationId)
  const setFederationId = useMoaStore((state) => state.setFederationId)
  const storePersonality = useMoaStore((state) => state.personality)
  const updateStorePersonality = useMoaStore((state) => state.setPersonality)
  const setGlobalMood = useMoaStore((state) => state.setMood)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setEntityError(null)
    const currentInput = input
    setInput('')

    try {
      const data = await analyzeMessage(currentInput, {
        userId: user?.id,
        federationId,
        walletAddress: walletAddress ?? undefined,
        personality: storePersonality,
        relationshipContext: entityState?.entityId
          ? {
              target_user_id: entityState.entityId,
              connection_type: 'relational-entity',
            }
          : undefined,
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
          attachments: data.attachments,
          audioCue: data.audioCue,
        },
      ])
      setColor(nextColor)
      setIntensity(emotionScore)
      setTimeline(data.timeline ?? [])

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
        metadata: { emotion, intensity: emotionScore },
        relationshipContext,
      })

      setIsEvolvingEntity(true)
      try {
        const relationalEntity = await evolveRelationalEntity({
          userId: user?.id ?? 'guest',
          emotion,
          entityId,
          walletAddress: walletAddress ?? undefined,
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
    <div className="chat-container mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 lg:flex-row">
      <div className="flex flex-col gap-4 lg:w-1/3">
        <CharacterAvatar
          color={color}
          intensity={intensity}
          entityImageUrl={entityState?.imageUrl}
          prompt={entityState?.prompt}
          connectionScore={entityState?.connectionScore}
          bonded={entityState?.bonded}
          isEvolving={isEvolvingEntity}
        />

        <div className="glass flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#111a38]/75 p-5 shadow-[0_24px_55px_rgba(6,10,28,0.55)]">
          <div className="text-[0.6rem] uppercase tracking-[0.45em] text-brand-mist/65">Relational Entity</div>
          {entityState ? (
            <>
              <p className="text-sm leading-relaxed text-brand-mist/90">{entityState.prompt}</p>
              <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/60">
                <span>
                  {Math.round(Math.max(0, Math.min(entityState.connectionScore, 1)) * 100)}% attunement
                </span>
                <span className={entityState.bonded ? 'text-brand-cypress' : 'text-brand-magnolia'}>
                  {entityState.bonded ? 'Bonded' : isEvolvingEntity ? 'Evolving' : 'Forming'}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-brand-mist/70">
              Share how you feel to invite your first entity. Each honest emotion deepens your connection.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="messages glass flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-[#121b3c]/70 p-5 shadow-[0_24px_55px_rgba(6,10,28,0.55)]">
          {messages.map((message, index) => (
            <div
              key={`${message.you}-${index}`}
              className="message rounded-2xl border border-white/5 bg-black/10 p-4 shadow-inner"
              style={{ borderLeft: `4px solid ${message.color}` }}
            >
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-mist/80">You:</strong> {message.you}
              </p>
              <div className="mt-1 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.4em] text-brand-mist/40">
                <span>Mirai resonance</span>
                <span className="text-brand-mist/60">{message.emotion}</span>
              </div>
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-mist/80">Mirai:</strong> {message.mirai}
              </p>
              {message.summary && (
                <p className="mt-2 text-xs leading-relaxed text-brand-mist/70">{message.summary}</p>
              )}
              {message.reasoning && (
                <p className="mt-2 text-[0.7rem] leading-relaxed text-brand-mist/60">{message.reasoning}</p>
              )}
              {message.insights && message.insights.length > 0 && (
                <ul className="mt-3 space-y-1 text-[0.7rem] text-brand-mist/65">
                  {message.insights.map((insight, insightIndex) => (
                    <li key={insight.id ?? `${message.you}-${index}-insight-${insightIndex}`} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-magnolia" />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="font-semibold text-brand-mist/80">{insight.label}</span>
                        {insight.detail && <span className="text-brand-mist/55">{insight.detail}</span>}
                      </div>
                      {typeof insight.weight === 'number' && (
                        <span className="self-start text-[0.6rem] uppercase tracking-[0.35em] text-brand-mist/40">
                          {Math.round(insight.weight * 100)}%
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {message.audioCue && (message.audioCue.title || message.audioCue.url || message.audioCue.intensity) && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-brand-mist/10 px-3 py-2 text-[0.7rem] text-brand-mist/75">
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
                      className="rounded-full border border-brand-magnolia/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-brand-magnolia transition hover:bg-brand-magnolia hover:text-[#0b1022]"
                    >
                      Listen
                    </a>
                  ) : null}
                </div>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-2 text-[0.7rem]">
                  {message.attachments.map((attachment, attachmentIndex) => {
                    const key = attachment.id ?? `${message.you}-${index}-attachment-${attachmentIndex}`
                    const content = (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-brand-mist/75 transition hover:border-brand-magnolia/60 hover:text-white">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {attachment.title ?? 'Attachment'}
                          </span>
                          {attachment.description && (
                            <span className="text-[0.65rem] text-brand-mist/55">{attachment.description}</span>
                          )}
                        </div>
                        <span className="text-[0.6rem] uppercase tracking-[0.45em] text-brand-mist/40">
                          {(attachment.type ?? 'View').toString()}
                        </span>
                      </div>
                    )

                    return attachment.url ? (
                      <a
                        key={key}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={key}>{content}</div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {error && <p className="error-message text-sm text-brand-cypress/80">{error}</p>}
        </div>

        {timeline.length > 0 && (
          <div className="timeline grid gap-3 md:grid-cols-2">
            {timeline.map((entry, index) => (
              <TimelineCard key={`${entry.emotion}-${index}`} data={entry} />
            ))}
          </div>
        )}

        {entityError && <p className="text-sm text-brand-cypress/80">{entityError}</p>}

        <div className="input-box glass flex items-center gap-3 rounded-3xl border border-white/10 bg-[#101737]/80 p-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder="Share a thought with Mirai..."
            disabled={isLoading}
            aria-label="Chat message input"
            className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-brand-mist/50 focus:border-brand-magnolia focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="rounded-2xl bg-brand-magnolia px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-brand-midnight transition hover:bg-brand-cypress disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
