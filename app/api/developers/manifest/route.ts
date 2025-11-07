import { NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/lib/api'

export const runtime = 'nodejs'

const SURFACES = [
  {
    slug: 'feed',
    description:
      'Publish scheduled lessons, reflections, and campaign drops that inherit reactions, insights, and notification loops.',
  },
  {
    slug: 'chat',
    description:
      'Trigger Amaris follow-ups, reflective prompts, or post-session debriefs so your users stay emotionally supported.',
  },
  {
    slug: 'avatar',
    description:
      'Cue stage states and motion presets to sync the live presence with what your external experience just taught.',
  },
  {
    slug: 'marketplace',
    description:
      'Stage commerce-ready drops once a quest is complete, carrying metadata straight into the collectibles surface.',
  },
]

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/autoposts/creative',
    description:
      'Request a structured autopost with sentiment scoring, recommended insights, and optional media attachments.',
    requiredFields: ['title', 'body', 'audience', 'scheduledAt'],
  },
  {
    method: 'POST',
    path: '/api/autoposts',
    description: 'Schedule a custom payload that you authored—perfect for episodic quests or curriculum beats.',
    requiredFields: ['body', 'scheduledAt'],
  },
  {
    method: 'POST',
    path: '/api/autoposts/release-due',
    description: 'Publish all queued entries whose release window is now or earlier. Helpful after external approvals.',
    requiredFields: ['releaseUntil'],
  },
  {
    method: 'GET',
    path: '/api/autoposts',
    description: 'List queued entries so your app can mirror schedule status or render analytics.',
    requiredFields: [],
  },
]

const WEBHOOKS = [
  {
    event: 'autopost.released',
    description: 'Sent when an entry is published to the feed with resolved metadata and sentiment annotations.',
  },
  {
    event: 'autopost.failed',
    description: 'Sent if validation or downstream delivery fails so you can retry or alert the creator.',
  },
]

const LIMITS = {
  defaultHourlyCalls: 5000,
  defaultDailyCalls: 50000,
  burst: 200,
}

export async function GET() {
  const baseUrl = getApiBaseUrl()

  return NextResponse.json({
    name: 'MarAI Developer Manifest',
    version: '2024.12.01',
    generatedAt: new Date().toISOString(),
    baseUrl,
    authentication: {
      strategy: 'supabase-session-token',
      header: 'Authorization: Bearer <supabaseAccessToken>',
      notes:
        'Create a Supabase session per MarAI user or use a service role token bound to your workspace. Tokens map every request to a verified identity.',
    },
    environments: {
      staging: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') ? baseUrl : undefined,
    },
    surfaces: SURFACES,
    endpoints: ENDPOINTS,
    webhooks: WEBHOOKS,
    limits: LIMITS,
    support: {
      contact: 'build@marai.studio',
      docs: '/developers',
    },
  })
}
