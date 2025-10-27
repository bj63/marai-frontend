import { useCallback, useMemo, useState } from 'react'

import type { GenerateImageRequest, GenerateImageResponse } from '../api'
import { generateImage } from '../api'

type UseImageGenerationOptions = {
  defaultStyleKey?: string
  defaultUserIdentifier?: string
}

type GenerateArgs = Omit<GenerateImageRequest, 'styleKey' | 'userIdentifier'> & {
  styleKey?: string
  userIdentifier?: string
}

type UseImageGenerationReturn = {
  data: GenerateImageResponse | null
  error: Error | null
  isLoading: boolean
  generate: (args: GenerateArgs) => Promise<void>
  reset: () => void
  lastRequest: {
    subject: string
    styleKey?: string
    userIdentifier?: string
  } | null
}

export function useImageGeneration(
  options: UseImageGenerationOptions = {},
): UseImageGenerationReturn {
  const { defaultStyleKey, defaultUserIdentifier } = options
  const [data, setData] = useState<GenerateImageResponse | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastRequest, setLastRequest] = useState<UseImageGenerationReturn['lastRequest']>(null)

  const resolvedDefaults = useMemo(
    () => ({
      styleKey: defaultStyleKey,
      userIdentifier: defaultUserIdentifier,
    }),
    [defaultStyleKey, defaultUserIdentifier],
  )

  const generate = useCallback(
    async ({ subject, styleKey, userIdentifier }: GenerateArgs) => {
      setIsLoading(true)
      setError(null)

      const requestPayload: GenerateImageRequest = {
        subject,
        styleKey: styleKey ?? resolvedDefaults.styleKey,
        userIdentifier: userIdentifier ?? resolvedDefaults.userIdentifier,
      }

      setLastRequest(requestPayload)

      try {
        const response = await generateImage(requestPayload)
        setData(response)
      } catch (err) {
        setData(null)
        setError(err instanceof Error ? err : new Error('Image generation failed'))
      } finally {
        setIsLoading(false)
      }
    },
    [resolvedDefaults.styleKey, resolvedDefaults.userIdentifier],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLastRequest(null)
  }, [])

  return {
    data,
    error,
    isLoading,
    generate,
    reset,
    lastRequest,
  }
}
