import { adaptiveTokens, type EmotionQuadrant } from './tokens'

export type EmotionSignalInput = {
  mood?: string | null
  label?: string | null
  sentiment?: string | null
  companySentiment?: number | null
  timelineSentiment?: number | null
  intensity?: number | null
  source?: string
}

const SENTIMENT_TO_QUADRANT: Record<string, EmotionQuadrant> = {
  positive: 'optimistic',
  delighted: 'optimistic',
  happy: 'optimistic',
  energized: 'charged',
  ecstatic: 'charged',
  charged: 'charged',
  urgent: 'urgent',
  anxious: 'urgent',
  crisis: 'urgent',
  reflective: 'reflective',
  melancholic: 'reflective',
  sad: 'reflective',
  calm: 'calm',
  neutral: 'calm',
  steady: 'calm',
}

const keywordToQuadrant = (value?: string | null): EmotionQuadrant | null => {
  if (!value) return null
  const normalised = value.trim().toLowerCase()
  return SENTIMENT_TO_QUADRANT[normalised] ?? null
}

const deriveFromScores = (signal?: EmotionSignalInput | null): EmotionQuadrant | null => {
  if (!signal) return null
  const sentiment = signal.companySentiment ?? signal.timelineSentiment
  if (typeof sentiment === 'number' && Number.isFinite(sentiment)) {
    if (sentiment >= 0.35) return 'optimistic'
    if (sentiment <= -0.4) return 'reflective'
  }

  if (typeof signal.intensity === 'number' && Number.isFinite(signal.intensity)) {
    if (signal.intensity >= 0.75) return 'charged'
    if (signal.intensity >= 0.55) return 'urgent'
  }
  return null
}

export function deriveEmotionQuadrant(
  signal: EmotionSignalInput | null,
  preferred?: string | null,
  fallback: EmotionQuadrant = 'calm',
): EmotionQuadrant {
  const fromSignalKeyword = keywordToQuadrant(signal?.label ?? signal?.mood ?? signal?.sentiment)
  const fromScores = deriveFromScores(signal)
  const preferredQuadrant = keywordToQuadrant(preferred)
  return fromSignalKeyword ?? fromScores ?? preferredQuadrant ?? fallback
}

export function getEmotionIcon(emotion: EmotionQuadrant): string {
  return adaptiveTokens.emotion[emotion].icon
}

