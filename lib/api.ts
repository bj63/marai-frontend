const DEFAULT_API_FALLBACKS = ['http://127.0.0.1:8000', 'http://localhost:8000', 'http://localhost:5000'] as const
const API_ENV_KEYS = ['NEXT_PUBLIC_API_BASE', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_MOA_API_URL'] as const
const DEFAULT_EMOTION = 'reflective'
const DEFAULT_COLOR = 'hsl(180,85%,60%)'

function resolveApiBase() {
  for (const key of API_ENV_KEYS) {
    const value = process.env[key]?.trim()
    if (value) {
      return value.replace(/\/$/, '')
    }
  }

  const fallback = DEFAULT_API_FALLBACKS.find((base) => base && base.length > 0)
  return (fallback ?? 'http://localhost:5000').replace(/\/$/, '')
}

export function getApiBaseUrl() {
  return resolveApiBase()
}

async function handleApiResponse<T>(response: Response, context: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  let errorMessage = `${context} failed: ${response.status} ${response.statusText}`

  try {
    const data = await response.json()
    if (data && typeof data.error === 'string' && data.error.trim().length > 0) {
      errorMessage = data.error
    }
  } catch (error) {
    const fallback = await response.text().catch(() => '')
    if (fallback.trim().length > 0) {
      errorMessage = `${errorMessage}. Details: ${fallback}`
    }
  }

  throw new Error(errorMessage)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pickString(values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  return null
}

function pickNumber(values: Array<unknown>): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return null
}

function normaliseNumericRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, raw]) => {
        const numeric = pickNumber([raw])
        return numeric === null ? null : [key, numeric]
      })
      .filter((entry): entry is [string, number] => Array.isArray(entry)),
  )
}

export interface AnalyzeTimelineEntry {
  emotion: string
  color: string
  personality?: Record<string, number>
  summary?: string | null
  timestamp?: string | null
  intensity?: number | null
}

export interface AnalyzeInsight {
  id?: string
  label: string
  detail?: string | null
  weight?: number | null
  emotion?: string | null
}

export interface AnalyzeAttachment {
  id?: string
  type?: string | null
  title?: string | null
  description?: string | null
  url?: string | null
}

export interface AnalyzeAudioCue {
  emotion?: string | null
  intensity?: number | null
  url?: string | null
  title?: string | null
}

export interface AnalyzeMediaDream {
  id: string
  title?: string | null
  prompt?: string | null
  description?: string | null
  mediaUrl?: string | null
  posterUrl?: string | null
  durationSeconds?: number | null
  shareUrl?: string | null
  type?: string | null
}

export interface AnalyzeResponse {
  emotion: string
  scores: Record<string, number>
  personality: Record<string, number>
  color: string
  aura: string
  timeline: AnalyzeTimelineEntry[]
  reply?: string | null
  summary?: string | null
  reasoning?: string | null
  insights?: AnalyzeInsight[]
  attachments?: AnalyzeAttachment[]
  audioCue?: AnalyzeAudioCue | null
  mediaDreams?: AnalyzeMediaDream[]
  federationId?: string | null
  cognitiveMap?: Record<string, number>
  metadata?: Record<string, unknown>
}

export interface AnalyzeMessageOptions {
  userId?: string
  federationId?: string | null
  walletAddress?: string | null
  personality?: Record<string, number> | null
  relationshipContext?: Record<string, unknown>
  includeTimeline?: boolean
  toneOverride?: string | null
  metadata?: Record<string, unknown>
}

type RawAnalyzeResponse = Record<string, unknown>

function normaliseTimeline(value: unknown): AnalyzeTimelineEntry[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      if (!isRecord(entry)) return null

      const emotion =
        pickString([entry.emotion, entry.core_emotion, entry.label, entry.state, entry.feeling]) ?? DEFAULT_EMOTION
      const color = pickString([entry.color, entry.aura, entry.hex, entry.hue]) ?? DEFAULT_COLOR
      const summary = pickString([entry.summary, entry.note, entry.narrative, entry.story])
      const timestamp = pickString([entry.timestamp, entry.ts, entry.occurred_at, entry.updated_at])
      const intensity = pickNumber([entry.intensity, entry.score, entry.weight])
      const personality = normaliseNumericRecord(entry.personality ?? entry.traits)

      return {
        emotion,
        color,
        personality: Object.keys(personality).length > 0 ? personality : undefined,
        summary: summary ?? null,
        timestamp: timestamp ?? null,
        intensity: intensity ?? null,
      }
    })
    .filter((entry): entry is AnalyzeTimelineEntry => entry !== null)
}

function normaliseInsights(value: unknown): AnalyzeInsight[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry, index) => {
      if (typeof entry === 'string') {
        const trimmed = entry.trim()
        if (trimmed.length === 0) return null
        return { id: `insight-${index}`, label: trimmed }
      }

      if (!isRecord(entry)) return null

      const label = pickString([entry.label, entry.title, entry.summary, entry.insight])
      if (!label) return null

      const detail = pickString([entry.detail, entry.description, entry.reasoning, entry.context])
      const weight = pickNumber([entry.weight, entry.score, entry.intensity, entry.confidence])
      const emotion = pickString([entry.emotion, entry.tone])

      return {
        id: pickString([entry.id, entry.key, entry.slug]) ?? `insight-${index}`,
        label,
        detail: detail ?? null,
        weight: weight ?? null,
        emotion: emotion ?? null,
      }
    })
    .filter((entry): entry is AnalyzeInsight => entry !== null)
}

function normaliseAttachments(...values: unknown[]): AnalyzeAttachment[] {
  const attachments: AnalyzeAttachment[] = []

  values.forEach((value) => {
    if (!value) return
    const list = Array.isArray(value) ? value : [value]

    list.forEach((entry, index) => {
      if (typeof entry === 'string') {
        const trimmed = entry.trim()
        if (trimmed.length === 0) return
        attachments.push({
          id: `attachment-${attachments.length}`,
          type: 'link',
          title: 'Attachment',
          url: trimmed,
        })
        return
      }

      if (!isRecord(entry)) return

      const title = pickString([entry.title, entry.name, entry.label])
      const description = pickString([entry.description, entry.detail, entry.subtitle, entry.context])
      const type = pickString([entry.type, entry.kind, entry.category])
      const url = pickString([entry.url, entry.href, entry.link, entry.track_url, entry.audio_url])

      if (!title && !description && !url) return

      attachments.push({
        id: pickString([entry.id, entry.key, entry.slug]) ?? `attachment-${attachments.length}`,
        type: type ?? null,
        title: title ?? null,
        description: description ?? null,
        url: url ?? null,
      })
    })
  })

  return attachments
}

function normaliseAudioCue(value: unknown): AnalyzeAudioCue | null {
  if (!value) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? { emotion: trimmed } : null
  }

  if (!isRecord(value)) return null

  const emotion = pickString([value.emotion, value.tone, value.label, value.state])
  const intensity = pickNumber([value.intensity, value.strength, value.score])
  const url = pickString([value.url, value.track_url, value.audio_url])
  const title = pickString([value.title, value.name])

  if (!emotion && !url && !title) {
    return null
  }

  return {
    emotion: emotion ?? null,
    intensity: intensity ?? null,
    url: url ?? null,
    title: title ?? null,
  }
}

function normaliseMediaDreams(...values: unknown[]): AnalyzeMediaDream[] {
  const dreams: AnalyzeMediaDream[] = []

  values.forEach((value) => {
    if (!value) return
    const list = Array.isArray(value) ? value : [value]

    list.forEach((entry, index) => {
      if (!isRecord(entry)) return

      const resolvedId =
        pickString([entry.id, entry.key, entry.slug, entry.dream_id, entry.dreamId]) ??
        `media-dream-${dreams.length}`
      const title = pickString([entry.title, entry.name, entry.label])
      const prompt = pickString([entry.prompt, entry.description, entry.context])
      const description = pickString([
        entry.summary,
        entry.story,
        entry.narrative,
        entry.subtitle,
        entry.caption,
      ])
      const mediaUrl = pickString([
        entry.media_url,
        entry.mediaUrl,
        entry.url,
        entry.asset_url,
        entry.video_url,
        entry.stream_url,
      ])
      const posterUrl = pickString([
        entry.poster_url,
        entry.posterUrl,
        entry.thumbnail,
        entry.thumbnail_url,
        entry.cover,
        entry.cover_url,
      ])
      const shareUrl = pickString([entry.share_url, entry.shareUrl])
      const durationSeconds = pickNumber([
        entry.duration_seconds,
        entry.durationSeconds,
        entry.duration,
        entry.length,
        entry.runtime,
      ])
      const type = pickString([entry.type, entry.kind, entry.category, entry.format])

      if (!title && !prompt && !mediaUrl && !posterUrl) {
        return
      }

      dreams.push({
        id: index === 0 ? resolvedId : `${resolvedId}-${index}`,
        title: title ?? null,
        prompt: prompt ?? null,
        description: description ?? null,
        mediaUrl: mediaUrl ?? null,
        posterUrl: posterUrl ?? null,
        durationSeconds: durationSeconds ?? null,
        shareUrl: shareUrl ?? null,
        type: type ?? null,
      })
    })
  })

  return dreams
}

function normaliseAnalyzeResponse(raw: RawAnalyzeResponse): AnalyzeResponse {
  const analysis = isRecord(raw.analysis) ? raw.analysis : null

  const emotion =
    pickString([
      raw.emotion,
      raw.core_emotion,
      analysis?.emotion,
      analysis?.core_emotion,
      analysis?.tone,
      analysis?.primary_emotion,
    ]) ?? DEFAULT_EMOTION

  const color = pickString([raw.color, analysis?.color, analysis?.aura_color]) ?? DEFAULT_COLOR
  const aura = pickString([raw.aura, analysis?.aura, analysis?.color]) ?? color

  const scores = normaliseNumericRecord(raw.scores ?? analysis?.scores)
  const personality = normaliseNumericRecord(raw.personality ?? analysis?.personality)
  const timeline = normaliseTimeline(raw.timeline ?? analysis?.timeline ?? analysis?.history)
  const reply = pickString([raw.reply, raw.response, raw.mirai_reply, analysis?.reply, analysis?.response])
  const summary = pickString([raw.summary, analysis?.summary, analysis?.headline])
  const reasoning = pickString([raw.reasoning, raw.explanation, analysis?.reasoning, analysis?.insight])
  const insights = normaliseInsights(raw.insights ?? analysis?.insights ?? analysis?.emotion_insights)
  const attachments = normaliseAttachments(raw.attachments, analysis?.attachments, raw.music_recommendations, analysis?.music)
  const audioCue = normaliseAudioCue(raw.audio_cue ?? analysis?.audio_cue ?? raw.sonic_signature ?? raw.soundscape)
  const mediaDreams = normaliseMediaDreams(
    raw.media_dreams,
    analysis?.media_dreams,
    raw.mediaDreams,
    analysis?.mediaDreams,
    raw.dreams,
    analysis?.dreams,
  )
  const federationId = pickString([raw.federation_id, raw.federationId, analysis?.federation_id, analysis?.federationId])
  const cognitiveMap = normaliseNumericRecord(raw.cognitive_map ?? analysis?.cognitive_map ?? analysis?.emotion_vector)
  const metadata = isRecord(raw.metadata) ? raw.metadata : undefined

  return {
    emotion,
    scores,
    personality,
    color,
    aura,
    timeline,
    reply: reply ?? null,
    summary: summary ?? null,
    reasoning: reasoning ?? null,
    insights: insights.length > 0 ? insights : undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
    audioCue,
    mediaDreams: mediaDreams.length > 0 ? mediaDreams : undefined,
    federationId: federationId ?? null,
    cognitiveMap: Object.keys(cognitiveMap).length > 0 ? cognitiveMap : undefined,
    metadata,
  }
}

export async function analyzeMessage(message: string, options: AnalyzeMessageOptions = {}) {
  const trimmedMessage = message.trim()
  if (!trimmedMessage) {
    throw new Error('Message cannot be empty.')
  }

  const basePayload: Record<string, unknown> = {
    message: trimmedMessage,
  }

  const payloadEntries: Array<[string, unknown]> = [
    ['user_id', options.userId?.trim() ?? undefined],
    ['federation_id', options.federationId?.trim() ?? undefined],
    ['wallet', options.walletAddress?.trim() ?? undefined],
    ['relationship_context', options.relationshipContext],
    ['include_timeline', options.includeTimeline],
    ['tone_override', options.toneOverride],
    ['metadata', options.metadata],
  ]

  if (options.personality && Object.keys(options.personality).length > 0) {
    payloadEntries.push(['personality', options.personality])
  }

  payloadEntries.forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      basePayload[key] = value
    }
  })

  const res = await fetch(`${resolveApiBase()}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(basePayload),
  })

  const raw = await handleApiResponse<RawAnalyzeResponse>(res, 'Analysis')
  return normaliseAnalyzeResponse(raw)
}

export type GenerateImageRequest = {
  subject: string
  styleKey?: string
  userIdentifier?: string
}

export type GenerateImageResponse = {
  imageUrl: string
  prompt: string
  seed: number
  styleKey: string
}

export async function generateImage(payload: GenerateImageRequest) {
  const trimmedSubject = payload.subject.trim()
  if (!trimmedSubject) {
    throw new Error('Subject is required to generate an image.')
  }

  const res = await fetch(`${resolveApiBase()}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, subject: trimmedSubject }),
  })

  return handleApiResponse<GenerateImageResponse>(res, 'Image generation')
}

export type RelationalEntityRequest = {
  userId: string
  emotion: string
  entityId?: string | null
  walletAddress?: string | null
  relationshipScore?: number | null
}

export type RelationalEntityResponse = {
  imageUrl: string | null
  prompt: string
  connectionScore: number
  bonded: boolean
  entityId: string | null
}

type RawRelationalEntityResponse = {
  image_url?: string | null
  imageUrl?: string | null
  prompt: string
  connection_score?: number | null
  connectionScore?: number | null
  bonded: boolean
  entity_id?: string | null
  entityId?: string | null
}

export async function evolveRelationalEntity(payload: RelationalEntityRequest) {
  const res = await fetch(`${resolveApiBase()}/api/relational-entity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      Object.fromEntries(
        Object.entries({
          user_id: payload.userId.trim(),
          emotion: payload.emotion,
          entity_id: payload.entityId ?? undefined,
          wallet: payload.walletAddress ?? undefined,
          relationship: payload.relationshipScore ?? undefined,
        }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
      ),
    ),
  })

  const raw = await handleApiResponse<RawRelationalEntityResponse>(res, 'Relational entity evolution')

  const imageUrl = raw.imageUrl ?? raw.image_url ?? null
  const connectionScore = raw.connectionScore ?? raw.connection_score ?? 0
  const entityId = raw.entityId ?? raw.entity_id ?? null

  return {
    imageUrl,
    prompt: raw.prompt,
    connectionScore: typeof connectionScore === 'number' ? connectionScore : 0,
    bonded: Boolean(raw.bonded),
    entityId,
  } satisfies RelationalEntityResponse
}

export interface RemoteDesignDNA {
  layout?: string | null
  theme_tokens?: Record<string, string> | null
  palette?: Record<string, string> | null
  motion?: Record<string, unknown> | null
  soundscape?: Record<string, unknown> | null
  depth?: unknown
  font?: string | null
  [key: string]: unknown
}

export interface DesignTheme {
  design_dna: RemoteDesignDNA
  evolution_stage: string | null
  preferred_emotion: string | null
  relational_signature?: Record<string, unknown> | null
}

export interface DesignContextRequest {
  user_id: string
  emotion: string
  intensity: number
  confidence: number
  user_state: string
  relationship_context?: Record<string, unknown>
}

export type DesignContextResponse = DesignTheme & {
  palette?: Record<string, string> | null
  theme_tokens?: Record<string, string> | null
}

export interface DesignFeedbackInteraction {
  metric: string
  value?: number
  sentiment?: string
  target_id?: string
  metadata?: Record<string, unknown>
}

export interface DesignFeedbackPayload {
  user_id: string
  action_type: string
  interactions: DesignFeedbackInteraction[]
  relationship_context?: Record<string, unknown>
}

export interface DesignFeedbackResponse {
  status: string
  design_dna?: RemoteDesignDNA
  evolution_stage?: string | null
  preferred_emotion?: string | null
  relational_signature?: Record<string, unknown> | null
}

function buildAuthHeaders(accessToken?: string | null) {
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {}
}

export async function getDesignTheme(userId: string, accessToken?: string | null) {
  const response = await fetch(`${resolveApiBase()}/design/theme/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(accessToken),
    },
    cache: 'no-store',
  })

  return handleApiResponse<DesignTheme>(response, 'Fetch design theme')
}

export async function postDesignContext(payload: DesignContextRequest, accessToken?: string | null) {
  const response = await fetch(`${resolveApiBase()}/design/context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  })

  return handleApiResponse<DesignContextResponse>(response, 'Submit design context')
}

export async function postDesignFeedback(payload: DesignFeedbackPayload, accessToken?: string | null) {
  const response = await fetch(`${resolveApiBase()}/design/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  })

  return handleApiResponse<DesignFeedbackResponse>(response, 'Submit design feedback')
}

export type FriendProfile = {
  userId: string
  displayName: string
  avatarUrl: string
  personalitySummary?: string
  trustMetrics?: Record<string, unknown>
  isOnline?: boolean
}

export type FriendConnection = {
  connectionId: number
  friendId: string
  friendSince: string
  friendshipStatus: string
  profile: FriendProfile | null
}

export type FriendRequest = {
  id: number
  senderId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export async function sendFriendRequest(targetUserId: string, accessToken?: string | null) {
  const normalized = targetUserId.trim()
  if (!normalized) {
    throw new Error('Target user ID is required to send a friend request.')
  }

  const response = await fetch(`${resolveApiBase()}/api/friend-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(accessToken),
    },
    body: JSON.stringify({ targetUserId: normalized }),
  })

  return handleApiResponse<FriendRequest>(response, 'Send friend request')
}
