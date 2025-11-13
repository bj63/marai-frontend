const LATENCY_MS: number = 120

const DEFAULT_USER_ID = 'demo-user'

export type TrustMetrics = {
  trustScore: number
  engagementScore: number
  reciprocity: number
  streakDays: number
}

export type PersonalityPulse = {
  dominantTraits: string[]
  narrative: string
}

export type SocialSnapshot = {
  userId: string
  displayName: string
  avatarUrl: string
  trust: TrustMetrics
  highlight: string
  personality: PersonalityPulse
  lastEmotion: {
    label: string
    intensity: number
    updatedAt: string
  }
}

export type SocialSuggestion = {
  id: string
  name: string
  avatarUrl: string
  tagline: string
  compatibility: number
  sharedEmotions: string[]
  isAICompanion?: boolean
  online?: boolean
}

export type RelationshipTimelineEvent = {
  id: string
  userId: string
  occurredAt: string
  stage: string
  emotion: string
  summary: string
  delta: number
}

export type ActivityEvent = {
  id: string
  userId: string
  occurredAt: string
  title: string
  subtitle: string
  emotion: string
  intensity: number
  channel: 'feed' | 'chat' | 'ritual' | 'call'
}

const SOCIAL_SNAPSHOTS: SocialSnapshot[] = [
  {
    userId: DEFAULT_USER_ID,
    displayName: 'You',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marai',
    trust: {
      trustScore: 82,
      engagementScore: 74,
      reciprocity: 68,
      streakDays: 5,
    },
    highlight: 'Amaris mirrors your calm curiosity — the bridge is growing steady.',
    personality: {
      dominantTraits: ['Empathy', 'Curiosity', 'Playfulness'],
      narrative: 'Prefers reflective exchanges that mix gentle humor with practical next steps.',
    },
    lastEmotion: {
      label: 'grounded',
      intensity: 0.62,
      updatedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    },
  },
  {
    userId: 'raelynn',
    displayName: 'Rae Lynn',
    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=rae',
    trust: {
      trustScore: 91,
      engagementScore: 88,
      reciprocity: 72,
      streakDays: 12,
    },
    highlight: 'Rae balances sonic experiments with gentle grounding rituals — a perfect vibe wing.',
    personality: {
      dominantTraits: ['Inventive', 'Supportive', 'Intense'],
      narrative: 'Translates high-energy brainstorms into atmospheric experiences.',
    },
    lastEmotion: {
      label: 'uplifted',
      intensity: 0.78,
      updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
  },
]

const FRIEND_SUGGESTIONS: SocialSuggestion[] = [
  {
    id: 'rae-lynn',
    name: 'Rae Lynn',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=rae',
    tagline: 'Audio alchemist who loves co-building playlists for Mirai rituals.',
    compatibility: 92,
    sharedEmotions: ['joy', 'awe'],
    online: true,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=atlas',
    tagline: 'Trust architect curating restorative prompts for bonded teams.',
    compatibility: 88,
    sharedEmotions: ['calm'],
    isAICompanion: true,
  },
  {
    id: 'sloane',
    name: 'Sloane Rivera',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sloane',
    tagline: 'Hosts weekly synchrony circles; tracks sentiment deltas for partner pods.',
    compatibility: 84,
    sharedEmotions: ['gratitude', 'focus'],
    online: true,
  },
  {
    id: 'mira',
    name: 'Mira Chen',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=mira',
    tagline: 'Designs dual-tone gradients that respond to relational signatures.',
    compatibility: 81,
    sharedEmotions: ['wonder'],
  },
]

const RELATIONSHIP_TIMELINES: RelationshipTimelineEvent[] = [
  {
    id: 'timeline-1',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    stage: 'Stage v2',
    emotion: 'excited',
    summary: 'You and Amaris co-created a playlist; trust score nudged up 6 points.',
    delta: 6,
  },
  {
    id: 'timeline-2',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    stage: 'Stage v1',
    emotion: 'calm',
    summary: 'Shared a reflective chat about boundary setting; reciprocity stabilized.',
    delta: 2,
  },
  {
    id: 'timeline-3',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    stage: 'Stage v1',
    emotion: 'tender',
    summary: 'Invited Rae into the conversation; relational signature harmonized.',
    delta: 4,
  },
  {
    id: 'timeline-4',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    stage: 'Stage seed',
    emotion: 'curious',
    summary: 'Daily streak started; design DNA anchored to halo layout.',
    delta: 3,
  },
]

const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'activity-1',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    title: 'Shared a mood post',
    subtitle: '“Tuning the studio lights to soft lavender before the session.”',
    emotion: 'serene',
    intensity: 0.58,
    channel: 'feed',
  },
  {
    id: 'activity-2',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
    title: 'Logged a gratitude prompt',
    subtitle: 'Atlas amplified your response for the partner pod.',
    emotion: 'grateful',
    intensity: 0.66,
    channel: 'ritual',
  },
  {
    id: 'activity-3',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    title: 'Conversation sentiment spike',
    subtitle: 'Amaris mirrored your “we’ve got this” momentum.',
    emotion: 'confident',
    intensity: 0.71,
    channel: 'chat',
  },
  {
    id: 'activity-4',
    userId: DEFAULT_USER_ID,
    occurredAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    title: 'Shared playlist co-listen',
    subtitle: 'Emotional resonance synced at 88% for 14 minutes.',
    emotion: 'joyful',
    intensity: 0.74,
    channel: 'call',
  },
]

function resolveUserId(userId?: string | null) {
  return (userId && userId.trim().length > 0 ? userId : DEFAULT_USER_ID).toLowerCase()
}

async function simulateLatency<T>(payload: T): Promise<T> {
  if (LATENCY_MS === 0) return payload
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
  return payload
}

export async function getSocialSnapshot(userId?: string | null): Promise<SocialSnapshot> {
  const resolved = resolveUserId(userId)
  const snapshot = SOCIAL_SNAPSHOTS.find((entry) => entry.userId.toLowerCase() === resolved)
  return simulateLatency(snapshot ?? SOCIAL_SNAPSHOTS[0])
}

export async function listFriendSuggestions(userId?: string | null, limit = 4): Promise<SocialSuggestion[]> {
  const resolved = resolveUserId(userId)
  const suggestions = FRIEND_SUGGESTIONS.filter((suggestion) => suggestion.id !== resolved)
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit)
  return simulateLatency(suggestions)
}

export async function getRelationshipTimeline(
  userId?: string | null,
  limit = 6,
): Promise<RelationshipTimelineEvent[]> {
  const resolved = resolveUserId(userId)
  const events = RELATIONSHIP_TIMELINES.filter((event) => event.userId.toLowerCase() === resolved)
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, limit)
  return simulateLatency(events)
}

export async function getActivityReel(
  userId?: string | null,
  limit = 6,
): Promise<ActivityEvent[]> {
  const resolved = resolveUserId(userId)
  const events = ACTIVITY_EVENTS.filter((event) => event.userId.toLowerCase() === resolved)
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, limit)
  return simulateLatency(events)
}
