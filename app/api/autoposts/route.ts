import { NextRequest, NextResponse } from 'next/server'
import { createGenericAutopost, listAutoposts, type AutopostAudience } from '@/lib/autopostQueue.server'

export const runtime = 'nodejs'

const parseMetadata = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null
    } catch (error) {
      return null
    }
  }
  return null
}

const toStringArray = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string')
  }
  if (typeof value === 'string') {
    return value
      .split(/[#,\s]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  }
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as 'scheduled' | 'publishing' | 'published' | null
  const cursor = searchParams.get('cursor')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  const { entries, nextCursor } = listAutoposts({ status: status ?? undefined, cursor, limit })

  return NextResponse.json({
    autoposts: entries,
    nextCursor,
  })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
    }

    const { body, mood, mediaUrl, posterUrl, metadata, scheduledAt, audience, hashtags, callToActionLabel, callToActionUrl } =
      payload as Record<string, unknown>

    if (typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'Body is required.' }, { status: 400 })
    }

    if (typeof scheduledAt !== 'string' || Number.isNaN(new Date(scheduledAt).getTime())) {
      return NextResponse.json({ error: 'scheduledAt must be a valid ISO timestamp.' }, { status: 400 })
    }

    const entry = createGenericAutopost({
      body: body.trim(),
      mood: typeof mood === 'string' ? mood : null,
      mediaUrl: typeof mediaUrl === 'string' ? mediaUrl : null,
      posterUrl: typeof posterUrl === 'string' ? posterUrl : null,
      metadata: parseMetadata(metadata),
      scheduledAt,
      audience: typeof audience === 'string' ? (audience as AutopostAudience) : null,
      hashtags: toStringArray(hashtags) ?? undefined,
      callToActionLabel: typeof callToActionLabel === 'string' ? callToActionLabel : null,
      callToActionUrl: typeof callToActionUrl === 'string' ? callToActionUrl : null,
    })

    return NextResponse.json({ autopost: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to schedule autopost.' }, { status: 500 })
  }
}
