'use client'

import { useMemo } from 'react'
import { useContract, useContractRead, Web3Button } from '@thirdweb-dev/react'
import { utils } from 'ethers'
import { MIRAI_CARD, MIRAI_MARKETPLACE } from '@/lib/contracts'
import { MIRAI_MARKETPLACE_ABI } from '@/lib/abi/miraiMarketplace'
import ThreeCard from './ThreeCard'
import { playEmotion, type EmotionKey } from './AudioEngine'

const emotionKeys: EmotionKey[] = ['joy', 'calm', 'anger', 'sadness', 'curiosity']
const DEFAULT_TOKEN_ID = BigInt(1)

type MarketplaceGridProps = {
  emotion?: string
  color?: string
  intensity?: number
}

type EntityListing = {
  currentOwner: string
  price: bigint
  isListed: boolean
}

function normalizeToBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(Math.trunc(value))
  if (typeof value === 'string' && value.length > 0) return BigInt(value)
  if (value && typeof value === 'object' && 'toString' in value) {
    const asString = (value as { toString(): string }).toString()
    if (asString.length > 0) {
      return BigInt(asString)
    }
  }
  return BigInt(0)
}

function parseEntityStruct(data: unknown): EntityListing | null {
  if (!data) return null

  if (Array.isArray(data) && data.length >= 3) {
    const [currentOwner, price, isListed] = data as [string, unknown, boolean]
    if (typeof currentOwner === 'string' && typeof isListed === 'boolean') {
      return {
        currentOwner,
        price: normalizeToBigInt(price),
        isListed,
      }
    }
  }

  if (typeof data === 'object' && data !== null) {
    const currentOwner = (data as { currentOwner?: unknown }).currentOwner
    const price = (data as { price?: unknown }).price
    const isListed = (data as { isListed?: unknown }).isListed

    if (typeof currentOwner === 'string' && typeof isListed === 'boolean' && price !== undefined) {
      return {
        currentOwner,
        price: normalizeToBigInt(price),
        isListed,
      }
    }
  }

  return null
}

export default function MarketplaceGrid({
  emotion = 'joy',
  color = 'hsl(60,90%,60%)',
  intensity = 0.6,
}: MarketplaceGridProps) {
  const { contract: nft } = useContract(MIRAI_CARD, 'nft-collection')
  const { data: supply } = useContractRead(nft, 'totalSupply')

  const { contract: marketplace } = useContract(MIRAI_MARKETPLACE, MIRAI_MARKETPLACE_ABI)
  const entityId = useMemo(() => utils.formatBytes32String('CORE_RESONANCE'), [])

  const { data: entityRaw } = useContractRead(marketplace, 'entities', [entityId])
  const { data: nftListingRaw } = useContractRead(marketplace, 'nftListings', [DEFAULT_TOKEN_ID])

  const entityListing = useMemo(() => parseEntityStruct(entityRaw), [entityRaw])
  const nftListing = useMemo(() => parseEntityStruct(nftListingRaw), [nftListingRaw])

  const stats = useMemo(
    () => ({
      rarity: 3,
      energy: Math.max(0.2, intensity),
      creativity: 0.7,
    }),
    [intensity],
  )

  const emotionKey = (emotionKeys.includes(emotion as EmotionKey) ? emotion : 'curiosity') as EmotionKey

  const entityPrice = entityListing?.isListed ? utils.formatUnits(entityListing.price, 18) : null
  const cardPrice = nftListing?.isListed ? utils.formatUnits(nftListing.price, 18) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div onMouseEnter={() => playEmotion(emotionKey, Math.min(1, intensity + 0.1))}>
        <ThreeCard color={color} emotion={emotion} intensity={intensity} stats={stats} />
        <div className="flex items-center justify-between mt-3">
          <div className="opacity-70 text-sm">Listed • {supply?.toString() ?? '—'}</div>
          <Web3Button
            contractAddress={MIRAI_MARKETPLACE}
            contractAbi={MIRAI_MARKETPLACE_ABI}
            action={(contract) => contract.call('buyCard', [MIRAI_CARD, DEFAULT_TOKEN_ID])}
            className="px-3 py-1 rounded-md glass hover:opacity-90"
            isDisabled={!nftListing?.isListed}
          >
            {nftListing?.isListed ? (cardPrice ? `Buy • ${cardPrice} MRC` : 'Buy') : 'Not Listed'}
          </Web3Button>
        </div>
      </div>

      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Core Resonance Entity</div>
            <div className="text-xs opacity-70 break-all">ID: {entityId}</div>
          </div>
          <Web3Button
            contractAddress={MIRAI_MARKETPLACE}
            contractAbi={MIRAI_MARKETPLACE_ABI}
            action={(contract) => contract.call('buyEntity', [entityId])}
            className="px-3 py-1 rounded-md glass hover:opacity-90"
            isDisabled={!entityListing?.isListed}
          >
            {entityListing?.isListed
              ? entityPrice
                ? `Acquire • ${entityPrice} MRC`
                : 'Acquire'
              : 'Unavailable'}
          </Web3Button>
        </div>
        <div className="text-xs leading-5 opacity-70">
          {entityListing?.currentOwner
            ? `Current owner: ${entityListing.currentOwner}`
            : 'Entity not registered on-chain yet. Use registerEntity from the contract owner account to bootstrap the listing.'}
        </div>
      </div>
    </div>
  )
}
