export interface AnalyzeTimelineEntry {
  emotion: string
  color: string
  personality: {
    energy: number
    creativity: number
    [key: string]: number
  }
  timestamp?: string
  [key: string]: unknown
}

export interface AnalyzeResponse {
  emotion: string
  color: string
  scores: Record<string, number>
  timeline?: AnalyzeTimelineEntry[]
  [key: string]: unknown
}

export async function analyzeMessage(message: string): Promise<AnalyzeResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || ''
  const endpoint = `${baseUrl}/api/analyze`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    throw new Error(`Failed to analyze message: ${res.statusText}`)
  }

  return res.json()
}
