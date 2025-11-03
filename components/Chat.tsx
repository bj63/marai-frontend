'use client'

import { useState } from 'react'
import { useAddress } from '@thirdweb-dev/react'
import CharacterAvatar from './CharacterAvatar'
import TimelineCard, { TimelineEntry } from './TimelineCard'
import { analyzeMessage, evolveRelationalEntity, type RelationalEntityResponse } from '@/lib/api'
import { handleError } from '@/lib/errorHandler'
import { useAuth } from '@/components/auth/AuthProvider'
import { useDesignTheme } from '@/components/design/DesignThemeProvider'

interface ChatMessage {
  you: string
  mirai: string
  color: string
}

const DEFAULT_COLOR = 'hsl(180,85%,60%)'
const DEFAULT_INTENSITY = 0.5

export default function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [intensity, setIntensity] = useState(DEFAULT_INTENSITY)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entityError, setEntityError] = useState<string | null>(null)
  const [entityState, setEntityState] = useState<RelationalEntityResponse | null>(null)
  const [entityId, setEntityId] = useState<string | null>(null)
  const [isEvolvingEntity, setIsEvolvingEntity] = useState(false)
  const { user } = useAuth()
  const { submitEmotionContext, registerInteraction } = useDesignTheme()
  const walletAddress = useAddress()

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setEntityError(null)
    const currentInput = input
    setInput('')

    try {
      const data = await analyzeMessage(currentInput)
      const nextColor = typeof data.color === 'string' && data.color.length > 0 ? data.color : DEFAULT_COLOR
      const emotion = typeof data.emotion === 'string' ? data.emotion : 'reflective'
      const emotionScore =
        typeof data.emotion === 'string' && data.scores && typeof data.scores[data.emotion] === 'number'
          ? data.scores[data.emotion]
          : DEFAULT_INTENSITY
      const confidence = Math.min(1, Math.max(0, emotionScore))
      const relationshipContext = entityState?.entityId
        ? {
            target_user_id: entityState.entityId,
            connection_type: 'relational-entity',
          }
        : undefined

      setMessages((prev) => [...prev, { you: currentInput, mirai: emotion, color: nextColor }])
      setColor(nextColor)
      setIntensity(emotionScore)
      setTimeline(data.timeline ?? [])

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
              <p className="text-sm leading-relaxed">
                <strong className="text-brand-mist/80">Mirai:</strong> {message.mirai}
              </p>
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
