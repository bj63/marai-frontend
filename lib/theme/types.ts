import type { DesignDNA } from '@/lib/supabaseApi'

export type NormalizedTheme = {
  design_dna: DesignDNA
  evolution_stage: string | null
  preferred_emotion: string | null
  relational_signature?: Record<string, unknown> | null
}

export type AdaptiveContentZone = 'hero' | 'summary' | 'cards' | 'autopost'

