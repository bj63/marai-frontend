import 'server-only'

import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client'

declare global {
  // eslint-disable-next-line no-var
  var __MIRAI_PROM_REGISTRY__: Registry | undefined
  // eslint-disable-next-line no-var
  var __MIRAI_SUPABASE_COUNTER__: Counter<'operation' | 'status'> | undefined
  // eslint-disable-next-line no-var
  var __MIRAI_SUPABASE_DURATION__: Histogram<'operation' | 'status'> | undefined
}

function ensureRegistry(): Registry {
  if (!globalThis.__MIRAI_PROM_REGISTRY__) {
    const registry = new Registry()
    collectDefaultMetrics({ register: registry })
    globalThis.__MIRAI_PROM_REGISTRY__ = registry
  }

  return globalThis.__MIRAI_PROM_REGISTRY__
}

function ensureCounter(register: Registry): Counter<'operation' | 'status'> {
  if (!globalThis.__MIRAI_SUPABASE_COUNTER__) {
    globalThis.__MIRAI_SUPABASE_COUNTER__ = new Counter({
      name: 'supabase_requests_total',
      help: 'Total Supabase operations grouped by operation and status.',
      labelNames: ['operation', 'status'],
      registers: [register],
    })
  }

  return globalThis.__MIRAI_SUPABASE_COUNTER__
}

function ensureHistogram(register: Registry): Histogram<'operation' | 'status'> {
  if (!globalThis.__MIRAI_SUPABASE_DURATION__) {
    globalThis.__MIRAI_SUPABASE_DURATION__ = new Histogram({
      name: 'supabase_request_duration_seconds',
      help: 'Duration of Supabase operations in seconds.',
      labelNames: ['operation', 'status'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
      registers: [register],
    })
  }

  return globalThis.__MIRAI_SUPABASE_DURATION__
}

function observe(
  operation: string,
  status: 'success' | 'error',
  durationMs?: number,
): void {
  const register = ensureRegistry()
  const counter = ensureCounter(register)
  const histogram = ensureHistogram(register)

  counter.inc({ operation, status })
  if (typeof durationMs === 'number') {
    histogram.observe({ operation, status }, durationMs / 1000)
  }
}

export function recordSupabaseSuccess(operation: string, durationMs?: number): void {
  observe(operation, 'success', durationMs)
}

export function recordSupabaseFailure(operation: string, durationMs?: number): void {
  observe(operation, 'error', durationMs)
}

export function getMetricsRegistry(): Registry {
  return ensureRegistry()
}
