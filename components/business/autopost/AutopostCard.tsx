'use client'

import ConnectionDreamAutopostCard from '@/components/business/autopost/ConnectionDreamAutopostCard'
import CreativeDreamVideoCard from '@/components/business/autopost/CreativeDreamVideoCard'
import CreativeImageArtCard from '@/components/business/autopost/CreativeImageArtCard'
import CreativePoemCard from '@/components/business/autopost/CreativePoemCard'
import CreativeStoryCard from '@/components/business/autopost/CreativeStoryCard'
import GenericAutopostCard from '@/components/business/autopost/GenericAutopostCard'
import SponsoredCampaignCard from '@/components/business/autopost/SponsoredCampaignCard'
import { isRecord, pickRecord, pickString } from '@/components/business/autopost/utils'
import type { AutopostQueueEntry } from '@/types/business'

const toLower = (value: string | null | undefined) => (value ? value.toLowerCase() : '')

const determineCreativeType = (
  entry: AutopostQueueEntry,
  metadataRecord: Record<string, unknown> | null,
): string => {
  const detailsType = entry.details?.creativeType ?? null
  const rootCreativeType = pickString(metadataRecord, 'creativeType', 'creative_type')
  const autopostRecord = pickRecord(metadataRecord, 'autopost', 'creative', 'payload', 'entry')
  const nestedType = pickString(autopostRecord, 'creativeType', 'creative_type', 'type')
  const fallback = entry.creativeType ?? pickString(autopostRecord, 'type')
  return toLower(detailsType ?? rootCreativeType ?? nestedType ?? fallback)
}

const hasConnectionDream = (
  entry: AutopostQueueEntry,
  metadataRecord: Record<string, unknown> | null,
): boolean => {
  if (entry.details?.connectionDream) {
    return true
  }
  if (metadataRecord) {
    const dreamRecord = pickRecord(metadataRecord, 'connectionDream', 'dream')
    if (dreamRecord) return true
  }
  return false
}

const hasAdCampaignMetadata = (
  entry: AutopostQueueEntry,
  metadataRecord: Record<string, unknown> | null,
): boolean => {
  if (entry.isPromoted || entry.feedHints?.isPromoted) {
    return true
  }
  if (metadataRecord) {
    if (pickRecord(metadataRecord, 'adCampaign', 'campaign', 'ad_campaign')) {
      return true
    }
    if (pickString(metadataRecord, 'type')?.toLowerCase() === 'adcampaign') {
      return true
    }
  }
  return false
}

const isCreativePoem = (creativeType: string, metadataRecord: Record<string, unknown> | null, detailType: string | null) => {
  if (creativeType === 'poem' || detailType === 'poem') return true
  const typeCandidate = pickString(metadataRecord, 'type')
  return typeCandidate?.toLowerCase() === 'poem'
}

const isCreativeStory = (creativeType: string, metadataRecord: Record<string, unknown> | null, detailType: string | null) => {
  if (creativeType === 'story' || creativeType === 'narrative' || detailType === 'story') return true
  const typeCandidate = pickString(metadataRecord, 'type')
  return typeCandidate?.toLowerCase() === 'story'
}

const isCreativeImage = (
  entry: AutopostQueueEntry,
  creativeType: string,
  metadataRecord: Record<string, unknown> | null,
  detailType: string | null,
) => {
  if (creativeType === 'imageart' || creativeType === 'image' || creativeType === 'art' || detailType === 'imageart') {
    return true
  }
  const typeCandidate = pickString(metadataRecord, 'type')
  if (typeCandidate && typeCandidate.toLowerCase().includes('image')) {
    return true
  }
  const categories = entry.details?.feedHints?.categories ?? entry.feedHints?.categories ?? []
  return categories?.some((value) => value?.toLowerCase().includes('image')) ?? false
}

interface AutopostCardProps {
  entry: AutopostQueueEntry
}

export default function AutopostCard({ entry }: AutopostCardProps) {
  const metadataRecord = isRecord(entry.metadata) ? entry.metadata : null
  const typeCandidate = pickString(metadataRecord, 'type', 'contentType', 'metadataType')
  const detailType = entry.details?.type ? entry.details.type.toLowerCase() : null
  const creativeType = determineCreativeType(entry, metadataRecord)
  const lowerType = typeCandidate ? typeCandidate.toLowerCase() : null

  if (hasConnectionDream(entry, metadataRecord) || lowerType === 'connectiondream' || detailType === 'connectiondream') {
    return <ConnectionDreamAutopostCard entry={entry} metadata={metadataRecord} />
  }

  if (hasAdCampaignMetadata(entry, metadataRecord)) {
    return <SponsoredCampaignCard entry={entry} metadata={metadataRecord} />
  }

  if (creativeType === 'dreamvideo' || creativeType === 'dream_video' || creativeType === 'dream') {
    return <CreativeDreamVideoCard entry={entry} metadata={metadataRecord} />
  }

  if (isCreativePoem(creativeType, metadataRecord, detailType)) {
    return <CreativePoemCard entry={entry} />
  }

  if (isCreativeStory(creativeType, metadataRecord, detailType)) {
    return <CreativeStoryCard entry={entry} />
  }

  if (isCreativeImage(entry, creativeType, metadataRecord, detailType)) {
    return <CreativeImageArtCard entry={entry} />
  }

  return <GenericAutopostCard entry={entry} />
}
