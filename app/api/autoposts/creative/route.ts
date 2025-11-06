import { NextRequest, NextResponse } from 'next/server'
import { createCampaignAutopost, type AutopostAudience, type AutopostCallToAction } from '@/lib/autopostQueue.server'

export const runtime = 'nodejs'

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  }
  return []
}

const buildCallToAction = (label: unknown, url: unknown): AutopostCallToAction | null => {
  const trimmedLabel = typeof label === 'string' ? label.trim() : ''
  const trimmedUrl = typeof url === 'string' ? url.trim() : ''
  if (!trimmedLabel && !trimmedUrl) {
    return null
  }
  return {
    label: trimmedLabel || null,
    url: trimmedUrl || null,
  }
}

const buildEmotionSignals = (sentiment: unknown) => {
  if (Array.isArray(sentiment)) {
    return sentiment
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null
        const record = entry as Record<string, unknown>
        const label = typeof record.label === 'string' ? record.label : null
        const confidence = typeof record.confidence === 'number' ? record.confidence : null
        if (!label || confidence === null || !Number.isFinite(confidence)) return null
        return {
          label,
          confidence: Math.max(0, Math.min(1, confidence)),
        }
      })
      .filter((entry): entry is { label: string; confidence: number } => Boolean(entry))
  }

  if (sentiment && typeof sentiment === 'object') {
    const record = sentiment as Record<string, unknown>
    const label = typeof record.label === 'string' ? record.label : 'uplifted'
    const confidenceValue = record.confidence
    const confidence = typeof confidenceValue === 'number' && Number.isFinite(confidenceValue) ? confidenceValue : 0.72
    return [
      {
        label,
        confidence: Math.max(0, Math.min(1, confidence)),
      },
    ]
  }

  return [
    {
      label: 'uplifted',
      confidence: 0.72,
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
    }

    const {
      creativeType,
      title,
      summary,
      inspirations,
      assetUrl,
      posterUrl,
      mediaUrl,
      durationSeconds,
      delaySeconds,
      audience,
      hashtags,
      callToActionLabel,
      callToActionUrl,
      brandName,
      campaignId,
      objective,
      sentiment,
      body,
    } = payload as Record<string, unknown>

    if (typeof creativeType !== 'string' || creativeType.trim().length === 0) {
      return NextResponse.json({ error: 'creativeType is required.' }, { status: 400 })
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required.' }, { status: 400 })
    }

    if (typeof summary !== 'string' || summary.trim().length === 0) {
      return NextResponse.json({ error: 'summary is required.' }, { status: 400 })
    }

    const inspirationList = toStringArray(inspirations)
    const hashtagList = toStringArray(hashtags)
    const scheduledAt = new Date(Date.now() + (typeof delaySeconds === 'number' ? Math.max(0, delaySeconds) : 3600) * 1000)
    const cta = buildCallToAction(callToActionLabel, callToActionUrl)
    const entry = createCampaignAutopost({
      campaignId:
        typeof campaignId === 'string' && campaignId.trim().length > 0
          ? campaignId.trim()
          : `cmp-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      brandName: typeof brandName === 'string' && brandName.trim().length > 0 ? brandName.trim() : 'MarAI Business',
      objective: typeof objective === 'string' && objective.trim().length > 0 ? objective.trim() : 'awareness',
      creativeType: creativeType.trim(),
      title: title.trim(),
      summary: summary.trim(),
      body:
        typeof body === 'string' && body.trim().length > 0
          ? body.trim()
          : `${summary}\n\nTap to explore how ${title.trim()} elevates your next moment.`,
      inspirations: inspirationList,
      hashtags: hashtagList,
      assetUrl: typeof assetUrl === 'string' ? assetUrl : null,
      posterUrl: typeof posterUrl === 'string' ? posterUrl : null,
      mediaUrl: typeof mediaUrl === 'string' ? mediaUrl : null,
      durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : null,
      audience: typeof audience === 'string' ? (audience as AutopostAudience) : 'public',
      callToAction: cta,
      emotionSignals: buildEmotionSignals(sentiment),
      scheduledAt: scheduledAt.toISOString(),
      delaySeconds: typeof delaySeconds === 'number' ? Math.max(0, delaySeconds) : null,
    })

    return NextResponse.json({ autopost: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to schedule creative autopost.' }, { status: 500 })
  }
}
