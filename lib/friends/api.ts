import { getApiBaseUrl } from '@/lib/api'

export type FriendConnection = {
  id: string
  name: string
  avatar: string
  tagline: string
  followsYou: boolean
  youFollow: boolean
  theirInnerCircle: boolean
  yourInnerCircle: boolean
  aiChatOptIn: boolean
  maraiId?: string
  locationSignal?: string
  postingOverlap?: string
  dreamLink?: string
  aiToAiSignal?: string
  signals?: string[]
}

type SocialGraphNode = {
  id?: string
  name?: string
  displayName?: string
  handle?: string
  username?: string
  avatar?: string
  avatarUrl?: string
  tagline?: string
  subtitle?: string
  followsYou?: boolean
  youFollow?: boolean
  innerCircle?: boolean
  inYourInnerCircle?: boolean
  aiChatOptIn?: boolean
  maraiId?: string
  marai_id?: string
  marai?: { id?: string }
  signals?: string[]
  locationSignal?: string
  postingOverlap?: string
  dreamLink?: string
  aiToAiSignal?: string
}

type SocialGraphResponse = {
  nodes?: SocialGraphNode[]
}

type ApiError = Error & { status?: number }

function apiBase(path: string) {
  const base = getApiBaseUrl()
  if (!base) return path
  return `${base}${path}`
}

async function parseError(response: Response, context: string): Promise<ApiError> {
  let message = `${context} failed: ${response.status} ${response.statusText}`

  try {
    const data = await response.json()
    if (data && typeof data.error === 'string' && data.error.trim().length > 0) {
      message = data.error
    }
  } catch {
    // ignore json parsing errors
  }

  const error = new Error(message) as ApiError
  error.status = response.status
  return error
}

async function apiFetch<T>(path: string, init: RequestInit = {}, context = 'Request'): Promise<T> {
  const response = await fetch(apiBase(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw await parseError(response, context)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function normaliseConnection(node: SocialGraphNode): FriendConnection | null {
  const id = node.id ?? node.handle ?? node.username
  if (!id) return null

  return {
    id,
    name: node.displayName ?? node.name ?? node.handle ?? node.username ?? 'Unknown',
    avatar: node.avatarUrl ?? node.avatar ?? '/avatars/collective.png',
    tagline: node.tagline ?? node.subtitle ?? 'Signal pending',
    followsYou: Boolean(node.followsYou),
    youFollow: Boolean(node.youFollow),
    theirInnerCircle: Boolean(node.innerCircle),
    yourInnerCircle: Boolean(node.inYourInnerCircle),
    aiChatOptIn: Boolean(node.aiChatOptIn),
    maraiId: node.maraiId ?? node.marai_id ?? node.marai?.id,
    locationSignal: node.locationSignal,
    postingOverlap: node.postingOverlap,
    dreamLink: node.dreamLink,
    aiToAiSignal: node.aiToAiSignal,
    signals: node.signals,
  }
}

export async function fetchFriendConnections(): Promise<FriendConnection[]> {
  const response = await apiFetch<SocialGraphResponse>('/api/graph/social', {}, 'Fetch social graph')
  const connections = (response.nodes ?? [])
    .map(normaliseConnection)
    .filter((item): item is FriendConnection => Boolean(item))

  return connections
}

export async function setFollowStatus(userId: string, follow: boolean) {
  await apiFetch(`/api/profile/${userId}/follow`, { method: 'POST', body: JSON.stringify({ follow }) }, 'Follow toggle')
}

export async function setInnerCircle(userId: string, enabled: boolean) {
  await apiFetch(
    `/api/friends/${userId}/inner-circle`,
    { method: 'POST', body: JSON.stringify({ enabled }) },
    'Inner Circle toggle',
  )
}

export async function setFriendAiChat(userId: string, enabled: boolean) {
  await apiFetch(
    `/api/friends/${userId}/ai-chat-opt-in`,
    { method: 'POST', body: JSON.stringify({ enabled }) },
    'Friend AI chat toggle',
  )
}

export async function setGlobalFriendAiChat(enabled: boolean) {
  await apiFetch(
    '/api/settings/friend-ai-chat',
    { method: 'POST', body: JSON.stringify({ enabled }) },
    'Global friend AI chat setting',
  )
}

export async function createRelationalMemoryEvent(params: {
  subjectId: string
  context: string
  tone: 'warm' | 'neutral'
  delta: number
}) {
  const { subjectId, context, tone, delta } = params
  await apiFetch(
    '/api/marai/memory',
    {
      method: 'POST',
      body: JSON.stringify({ relationType: 'SOCIAL', subjectId, context, tone, delta }),
    },
    'Relational memory event',
  )
}
