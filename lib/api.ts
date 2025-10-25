export async function analyzeMessage(message: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) throw new Error('Analyze failed')

  return res.json() as Promise<{
    emotion: string
    scores: Record<string, number>
    personality: Record<string, number>
    color: string
    aura: string
    timeline?: { emotion: string; color: string; personality?: Record<string, number> }[]
  }>
}
