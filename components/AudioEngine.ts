export type EmotionKey = 'joy' | 'calm' | 'anger' | 'sadness' | 'curiosity'

let Tone: typeof import('tone') | null = null

async function loadTone() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!Tone) {
    Tone = await import('tone')
  }

  return Tone
}

export function playEmotion(emotion: EmotionKey, intensity: number) {
  if (typeof window === 'undefined') {
    return
  }

  loadTone()
    .then((toneLib) => {
      if (!toneLib) {
        return
      }

      const now = toneLib.now()
      const synth = new toneLib.PolySynth(toneLib.Synth).toDestination()
      const reverb = new toneLib.Reverb({ decay: 3, wet: 0.3 }).toDestination()
      synth.connect(reverb)

      const map: Record<EmotionKey, string[]> = {
        joy: ['C5', 'E5', 'G5'],
        calm: ['A3', 'C4', 'E4'],
        anger: ['E2', 'G2', 'A#2'],
        sadness: ['F3', 'Ab3', 'C4'],
        curiosity: ['D4', 'F#4', 'A4'],
      }

      const notes = map[emotion]
      const duration = Math.max(0.1, 0.6 * intensity)

      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, duration, now + index * 0.05)
      })
    })
    .catch((error) => {
      console.error('AudioEngine.playEmotion', error)
    })
}
