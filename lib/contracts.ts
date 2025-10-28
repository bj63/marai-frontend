const MIRAI_CARD_ENV = process.env.NEXT_PUBLIC_MIRAI_CARD
if (typeof MIRAI_CARD_ENV !== 'string' || MIRAI_CARD_ENV.trim().length === 0) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_MIRAI_CARD')
}
export const MIRAI_CARD_ADDRESS = MIRAI_CARD_ENV

const MIRAI_COIN_ENV = process.env.NEXT_PUBLIC_MIRAI_COIN
if (typeof MIRAI_COIN_ENV !== 'string' || MIRAI_COIN_ENV.trim().length === 0) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_MIRAI_COIN')
}
export const MIRAI_COIN_ADDRESS = MIRAI_COIN_ENV

const MIRAI_MARKETPLACE_ENV = process.env.NEXT_PUBLIC_MIRAI_MARKETPLACE
if (
  typeof MIRAI_MARKETPLACE_ENV !== 'string' ||
  MIRAI_MARKETPLACE_ENV.trim().length === 0
) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_MIRAI_MARKETPLACE')
}
export const MIRAI_MARKETPLACE_ADDRESS = MIRAI_MARKETPLACE_ENV

export const MIRAI_CARD = MIRAI_CARD_ADDRESS
export const MIRAI_COIN = MIRAI_COIN_ADDRESS
export const MIRAI_MARKETPLACE = MIRAI_MARKETPLACE_ADDRESS
