import { NextResponse } from 'next/server'
import { getMetricsRegistry } from '@/lib/metrics.server'

export const runtime = 'nodejs'

export async function GET() {
  const registry = getMetricsRegistry()
  const body = await registry.metrics()

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': registry.contentType,
      'Cache-Control': 'no-store',
    },
  })
}
