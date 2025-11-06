import { NextRequest, NextResponse } from 'next/server'
import { publishAutopost } from '@/lib/autopostQueue.server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const autopostId = Number(params.id)
    if (!Number.isFinite(autopostId) || autopostId <= 0) {
      return NextResponse.json({ error: 'Invalid autopost id.' }, { status: 400 })
    }

    const payload = await request.json()
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
    }

    const { publishedAt } = payload as Record<string, unknown>
    if (typeof publishedAt !== 'string' || Number.isNaN(new Date(publishedAt).getTime())) {
      return NextResponse.json({ error: 'publishedAt must be a valid ISO timestamp.' }, { status: 400 })
    }

    const { entry } = publishAutopost(autopostId, publishedAt)
    return NextResponse.json({ autopost: entry })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to publish autopost.' }, { status: 500 })
  }
}
