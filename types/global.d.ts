import type { Counter, Histogram, Registry } from 'prom-client'

declare global {
  var __MIRAI_PROM_REGISTRY__: Registry | undefined
  var __MIRAI_SUPABASE_COUNTER__: Counter<'operation' | 'status'> | undefined
  var __MIRAI_SUPABASE_DURATION__: Histogram<'operation' | 'status'> | undefined
}

export {}
