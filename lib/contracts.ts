const MIRAI_CARD = process.env.NEXT_PUBLIC_MIRAI_CARD
const MIRAI_COIN = process.env.NEXT_PUBLIC_MIRAI_COIN
const MIRAI_MARKETPLACE = process.env.NEXT_PUBLIC_MIRAI_MARKETPLACE

if (!MIRAI_CARD || MIRAI_CARD.trim().length === 0) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_MIRAI_CARD')
}

if (!MIRAI_COIN || MIRAI_COIN.trim().length === 0) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_MIRAI_COIN')
}

if (!MIRAI_MARKETPLACE || MIRAI_MARKETPLACE.trim().length === 0) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_MIRAI_MARKETPLACE')
}

export const MIRAI_CARD_ADDRESS = MIRAI_CARD
export const MIRAI_COIN_ADDRESS = MIRAI_COIN
export const MIRAI_MARKETPLACE_ADDRESS = MIRAI_MARKETPLACE

export const MIRAI_CARD = MIRAI_CARD_ADDRESS
export const MIRAI_COIN = MIRAI_COIN_ADDRESS
export const MIRAI_MARKETPLACE = MIRAI_MARKETPLACE_ADDRESS
