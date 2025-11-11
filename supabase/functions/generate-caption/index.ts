import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'

type CaptionPayload = {
  mood?: string
  message?: string
}

type CaptionResponse = {
  caption: string
}

const STYLE_SUFFIXES: Record<string, string> = {
  default:
    'Keep it poetic yet grounded, end with an emoji that matches the tone, highlight the communal vibe of the lab.',
  euphoric:
    'Lean into kinetic verbs, spotlight synth energy, mention the pulse of the room, close with a spark emoji.',
  focused:
    'Keep it intentional and calm, reference deep work or iteration, finish with a compass or target emoji.',
  reflective:
    'Invite introspection, nod to shared memory, end with a moon or water emoji.',
}

function normalizeMood(mood: string | undefined): keyof typeof STYLE_SUFFIXES {
  if (!mood) return 'default'
  const normalized = mood.trim().toLowerCase()
  if (normalized in STYLE_SUFFIXES) {
    return normalized as keyof typeof STYLE_SUFFIXES
  }
  return 'default'
}

function synthesizeCaption({ mood, message }: CaptionPayload): string {
  const cleanedMessage = (message ?? '').trim()
  const summary = cleanedMessage.length > 0 ? cleanedMessage : 'Sharing today\'s studio pulse.'
  const finalMood = normalizeMood(mood)
  const suffix = STYLE_SUFFIXES[finalMood]
  return `${summary} ${suffix}`.trim()
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let payload: CaptionPayload
  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const caption = synthesizeCaption(payload)
  const body: CaptionResponse = { caption }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
