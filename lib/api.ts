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
