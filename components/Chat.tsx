'use client'

import { useState } from 'react'
import CharacterAvatar from './CharacterAvatar'
import TimelineCard, { TimelineEntry } from './TimelineCard'
import { analyzeMessage } from '@/lib/api'
import { handleError } from '@/lib/errorHandler'

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
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

      setMessages((prev) => [...prev, { you: currentInput, mirai: emotion, color: nextColor }])
      setColor(nextColor)
      setIntensity(emotionScore)
      setTimeline(data.timeline ?? [])
    } catch (err) {
      const message = handleError(
        err,
        'Chat.handleSend',
        'We hit a snag connecting to Mirai. Please try again in a moment.',
      )
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-container">
      <CharacterAvatar color={color} intensity={intensity} />

      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={`${message.you}-${index}`}
            className="message"
            style={{ borderLeft: `4px solid ${message.color}` }}
          >
            <p>
              <strong>You:</strong> {message.you}
            </p>
            <p>
              <strong>Mirai:</strong> {message.mirai}
            </p>
          </div>
        ))}
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="timeline">
        {timeline.map((entry, index) => (
          <TimelineCard key={`${entry.emotion}-${index}`} data={entry} />
        ))}
      </div>

      <div className="input-box">
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
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
