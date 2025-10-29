import * as Sentry from '@sentry/nextjs'

type Extras = Record<string, unknown>

type MetricsModule = typeof import('./metrics.server')

let metricsModulePromise: Promise<MetricsModule> | null = null
let metricsBootstrapFailed = false

function loadMetricsModule(): Promise<MetricsModule> {
  if (metricsModulePromise) {
    return metricsModulePromise
  }

  metricsModulePromise = import('./metrics.server')
  return metricsModulePromise
}

function withMetrics(
  callback: (module: MetricsModule) => void,
): void {
  if (typeof window !== 'undefined') {
    return
  }

  loadMetricsModule()
    .then((module) => {
      callback(module)
    })
    .catch((error) => {
      if (!metricsBootstrapFailed && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[observability] Failed to bootstrap metrics module', error)
      }
      metricsBootstrapFailed = true
    })
}

function coerceError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  return new Error('Unknown error', { cause: error })
}

export function reportError(context: string, error: unknown, extras?: Extras): void {
  const normalizedError = coerceError(error)

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, error)
    if (extras) {
      // eslint-disable-next-line no-console
      console.debug(`[${context}] extras`, extras)
    }
  }

  Sentry.withScope((scope) => {
    scope.setTag('context', context)
    if (extras) {
      scope.setContext('extras', extras)
    }
    scope.setLevel('error')
    scope.setExtra('originalValue', error)
    Sentry.captureException(normalizedError)
  })
}

export function recordSupabaseSuccess(operation: string, durationMs?: number): void {
  withMetrics((module) => module.recordSupabaseSuccess(operation, durationMs))
}

export function recordSupabaseFailure(operation: string, durationMs?: number): void {
  withMetrics((module) => module.recordSupabaseFailure(operation, durationMs))
}
