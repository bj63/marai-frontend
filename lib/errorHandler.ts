import { reportError } from './observability'

type Logger = (message?: unknown, ...optionalParams: unknown[]) => void

const defaultLogger: Logger = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(...args)
  }
}

export function handleError(
  error: unknown,
  context: string,
  fallbackMessage = 'An unexpected error occurred.',
  logger: Logger = defaultLogger,
): string {
  const prefix = `[${context}]`
  reportError(context, error)
  if (error instanceof Error) {
    logger(prefix, error)
    return error.message || fallbackMessage
  }

  if (typeof error === 'string') {
    logger(prefix, error)
    return error.trim() || fallbackMessage
  }

  logger(prefix, error)
  return fallbackMessage
}
