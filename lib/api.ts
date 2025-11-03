const DEFAULT_API_BASE = 'http://localhost:5000'

function resolveApiBase() {
  const configuredBase = process.env.NEXT_PUBLIC_API_BASE?.trim()
  if (configuredBase && configuredBase.length > 0) {
    return configuredBase.replace(/\/$/, '')
  }
  return DEFAULT_API_BASE
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

export async function analyzeMessage(message: string) {
  const trimmedMessage = message.trim()
  if (!trimmedMessage) {
    throw new Error('Message cannot be empty.')
  }

  const res = await fetch(`${resolveApiBase()}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: trimmedMessage }),
  })

  return handleApiResponse<{
    emotion: string
    scores: Record<string, number>
    personality: Record<string, number>
    color: string
    aura: string
    timeline?: { emotion: string; color: string; personality?: Record<string, number> }[]
  }>(res, 'Analysis')
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
