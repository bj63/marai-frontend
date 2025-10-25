'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ConnectWallet,
  useAddress,
  useContract,
  useReadContract,
  Web3Button,
} from '@thirdweb-dev/react'
import { formatUnits, parseUnits } from 'ethers'
import {
  MIRAI_CARD_ADDRESS,
  MIRAI_COIN_ADDRESS,
  MIRAI_MARKETPLACE_ADDRESS,
  miraiCardAbi,
  miraiMarketplaceAbi,
} from '@/lib/contracts'

interface ListingSummary {
  tokenId: bigint
  seller: string
  price: bigint
  active: boolean
}

type RawListing =
  | {
      tokenId?: bigint | number | string
      seller?: string
      price?: bigint | number | string
      active?: boolean
    }
  | readonly unknown[]

interface TokenMetadata {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{ trait_type?: string; value?: string | number }>
  emotion?: string
  auraColor?: string
  rarity?: number
  personality?: {
    energy?: number
    creativity?: number
    empathy?: number
    logic?: number
  }
}

const DECIMALS = 18

function parseListing(rawListing: RawListing): ListingSummary | null {
  if (!rawListing) return null

  const listingArray = Array.isArray(rawListing) ? rawListing : []
  const tokenIdSource = !Array.isArray(rawListing) ? rawListing.tokenId : listingArray[0]
  const sellerSource = !Array.isArray(rawListing) ? rawListing.seller : listingArray[1]
  const priceSource = !Array.isArray(rawListing) ? rawListing.price : listingArray[2]
  const activeSource = !Array.isArray(rawListing) ? rawListing.active : listingArray[3]

  const tokenId = BigInt(tokenIdSource ?? 0)
  const seller = String(sellerSource ?? '')
  const price = BigInt(priceSource ?? 0)
  const active = Boolean(activeSource ?? false)

  return { tokenId, seller, price, active }
}

export default function Marketplace() {
  const address = useAddress()
  const { contract: marketplace } = useContract(MIRAI_MARKETPLACE_ADDRESS, miraiMarketplaceAbi)
  const { contract: card } = useContract(MIRAI_CARD_ADDRESS, miraiCardAbi)

  const { data: listingsData, isLoading: isLoadingListings } = useReadContract(
    marketplace,
    'getActiveListings'
  )

  const listings = useMemo(() => {
    if (!listingsData) return [] as ListingSummary[]
    if (Array.isArray(listingsData)) {
      return listingsData
        .map((entry) => parseListing(entry))
        .filter((value): value is ListingSummary => Boolean(value && value.active))
    }
    return [] as ListingSummary[]
  }, [listingsData])

  const [metadataMap, setMetadataMap] = useState<Record<string, TokenMetadata>>({})
  const [listTokenId, setListTokenId] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!card || listings.length === 0) return

      const nextMap: Record<string, TokenMetadata> = {}
      for (const listing of listings) {
        try {
          const tokenURI = await card.call('tokenURI', [listing.tokenId])
          if (typeof tokenURI === 'string' && tokenURI.length > 0) {
            const resolved = tokenURI.startsWith('ipfs://')
              ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`
              : tokenURI
            const response = await fetch(resolved)
            if (response.ok) {
              const json = (await response.json()) as TokenMetadata
              nextMap[listing.tokenId.toString()] = json
            }
          }
        } catch (error) {
          console.warn('Failed to resolve metadata for token', listing.tokenId.toString(), error)
        }
      }
      setMetadataMap(nextMap)
    }

    fetchMetadata().catch((error) => console.error(error))
  }, [card, listings])

  const handleListValidation = () => {
    setFormError(null)
    if (!listTokenId.trim() || !listPrice.trim()) {
      setFormError('Token ID and price are required to list an NFT.')
      return false
    }
    if (Number.isNaN(Number(listTokenId))) {
      setFormError('Token ID must be a valid number.')
      return false
    }
    if (Number(listPrice) <= 0) {
      setFormError('Price must be greater than zero.')
      return false
    }
    return true
  }

  const renderListing = (listing: ListingSummary) => {
    const key = listing.tokenId.toString()
    const metadata = metadataMap[key]
    const price = formatUnits(listing.price, DECIMALS)

    const emotionAttribute = metadata?.attributes?.find((attribute) => attribute.trait_type === 'Emotion')
    const auraAttribute = metadata?.attributes?.find((attribute) => attribute.trait_type === 'Aura')
    const rarityAttribute = metadata?.attributes?.find((attribute) => attribute.trait_type === 'Rarity')

    return (
      <div key={key} className="marketplace-card">
        <div className="marketplace-card__header">
          <h3>{metadata?.name ?? `Mirai Card #${key}`}</h3>
          <span className="marketplace-price">{price} MRC</span>
        </div>
        {metadata?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={metadata.image} alt={metadata?.name ?? `Mirai Card #${key}`} className="marketplace-image" />
        )}
        <p className="marketplace-description">{metadata?.description ?? 'Dynamic emotional NFT from Mirai.'}</p>
        <div className="marketplace-attributes">
          <span>Emotion: {metadata?.emotion ?? (emotionAttribute?.value as string) ?? 'Unknown'}</span>
          <span>Aura: {metadata?.auraColor ?? (auraAttribute?.value as string) ?? 'N/A'}</span>
          <span>Rarity: {metadata?.rarity ?? Number(rarityAttribute?.value ?? 0)}%</span>
        </div>
        {metadata?.personality && (
          <div className="marketplace-personality">
            <h4>Personality Pulse</h4>
            <div className="personality-grid">
              <span>Energy: {metadata.personality.energy ?? '-'}%</span>
              <span>Creativity: {metadata.personality.creativity ?? '-'}%</span>
              <span>Empathy: {metadata.personality.empathy ?? '-'}%</span>
              <span>Logic: {metadata.personality.logic ?? '-'}%</span>
            </div>
          </div>
        )}
        <div className="marketplace-actions">
          <Web3Button
            contractAddress={MIRAI_MARKETPLACE_ADDRESS}
            action={(contract) => contract.call('buyCard', [listing.tokenId])}
            onError={(error) => console.error('Failed to purchase card', error)}
          >
            Buy with MRC
          </Web3Button>
        </div>
        <p className="marketplace-meta">Seller: {listing.seller}</p>
      </div>
    )
  }

  if (!MIRAI_MARKETPLACE_ADDRESS || !MIRAI_CARD_ADDRESS || !MIRAI_COIN_ADDRESS) {
    return (
      <div className="marketplace-container">
        <h2>Mirai Marketplace</h2>
        <p className="marketplace-warning">
          Please configure contract addresses in <code>.env.local</code> before accessing the marketplace.
        </p>
      </div>
    )
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-topbar">
        <h2>Mirai Marketplace</h2>
        <ConnectWallet theme="light" btnTitle={address ? 'Wallet Connected' : 'Connect Wallet'} />
      </div>

      <section className="marketplace-info">
        <h3>How it works</h3>
        <ul>
          <li>Mint Mirai emotional cards and evolve them with new emotion data.</li>
          <li>
            List NFTs for sale using <strong>MiraiCoin (MRC)</strong>. Approve both the marketplace contract and token
            allowance before listing.
          </li>
          <li>Every trade routes a 5% royalty back to the Mirai collective treasury.</li>
        </ul>
      </section>

      <section className="marketplace-form">
        <h3>List an emotional card</h3>
        <div className="marketplace-form-grid">
          <label htmlFor="tokenId">
            Token ID
            <input
              id="tokenId"
              value={listTokenId}
              onChange={(event) => setListTokenId(event.target.value)}
              placeholder="e.g. 7"
              type="number"
              min="0"
            />
          </label>
          <label htmlFor="price">
            Price (MRC)
            <input
              id="price"
              value={listPrice}
              onChange={(event) => setListPrice(event.target.value)}
              placeholder="e.g. 250"
              type="number"
              min="0"
              step="0.01"
            />
          </label>
        </div>
        {formError && <p className="marketplace-error">{formError}</p>}
        <Web3Button
          contractAddress={MIRAI_MARKETPLACE_ADDRESS}
          action={async (contract) => {
            if (!handleListValidation()) return
            const tokenId = BigInt(listTokenId)
            const price = parseUnits(listPrice, DECIMALS)
            await contract.call('listCard', [tokenId, price])
            setListTokenId('')
            setListPrice('')
          }}
          onError={(error) => {
            console.error('Failed to list card', error)
            setFormError('Listing failed. Ensure approvals are granted and try again.')
          }}
        >
          List Card
        </Web3Button>
        <p className="marketplace-hint">
          Tip: Use your wallet to approve MiraiCoin spending and NFT transfers for the marketplace contract before
          listing.
        </p>
      </section>

      <section className="marketplace-listings">
        <h3>Live Listings</h3>
        {isLoadingListings && <p className="marketplace-loading">Loading listings from Polygon…</p>}
        {!isLoadingListings && listings.length === 0 && (
          <p className="marketplace-empty">No cards are listed yet. Be the first to share Mirai&apos;s emotional energy!</p>
        )}
        <div className="marketplace-grid">
          {listings.map((listing) => renderListing(listing))}
        </div>
      </section>
    </div>
  )
}
