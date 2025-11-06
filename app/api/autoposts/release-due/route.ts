import { NextRequest, NextResponse } from 'next/server'
import { releaseDueAutoposts } from '@/lib/autopostQueue.server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
    }

    const { releaseUntil } = payload as Record<string, unknown>
    if (typeof releaseUntil !== 'string' || Number.isNaN(new Date(releaseUntil).getTime())) {
      return NextResponse.json({ error: 'releaseUntil must be a valid ISO timestamp.' }, { status: 400 })
    }

    const released = releaseDueAutoposts(releaseUntil)
    return NextResponse.json({ autoposts: released })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to release due autoposts.' }, { status: 500 })
  }
}
