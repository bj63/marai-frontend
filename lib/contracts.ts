function getRequiredEnv(value: string | undefined, key: string) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }
  throw new Error(`Missing required environment variable: ${key}`)
}

export const MIRAI_CARD_ADDRESS = getRequiredEnv(
  process.env.NEXT_PUBLIC_MIRAI_CARD,
  'NEXT_PUBLIC_MIRAI_CARD'
)
export const MIRAI_COIN_ADDRESS = getRequiredEnv(
  process.env.NEXT_PUBLIC_MIRAI_COIN,
  'NEXT_PUBLIC_MIRAI_COIN'
)
export const MIRAI_MARKETPLACE_ADDRESS = getRequiredEnv(
  process.env.NEXT_PUBLIC_MIRAI_MARKETPLACE,
  'NEXT_PUBLIC_MIRAI_MARKETPLACE'
)

export const MIRAI_CARD = MIRAI_CARD_ADDRESS
export const MIRAI_COIN = MIRAI_COIN_ADDRESS
export const MIRAI_MARKETPLACE = MIRAI_MARKETPLACE_ADDRESS
