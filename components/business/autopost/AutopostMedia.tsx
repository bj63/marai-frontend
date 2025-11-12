'use client'

import Image from 'next/image'
import { isSafeExternalUrl } from '@/components/business/autopost/utils'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v']

const inferExtension = (url: string) => {
  const withoutQuery = url.split('?')[0] ?? url
  const extension = withoutQuery.split('.').pop()
  return extension ? extension.toLowerCase() : null
}

const inferMediaKind = (url: string | null, creativeType?: string | null) => {
  if (creativeType && creativeType.toLowerCase().includes('video')) {
    return 'video'
  }
  if (!url) {
    return 'image'
  }
  const extension = inferExtension(url)
  if (!extension) {
    return 'image'
  }
  if (VIDEO_EXTENSIONS.includes(extension)) {
    return 'video'
  }
  if (IMAGE_EXTENSIONS.includes(extension)) {
    return 'image'
  }
  return creativeType?.toLowerCase().includes('video') ? 'video' : 'image'
}

interface AutopostMediaProps {
  mediaUrl?: string | null
  posterUrl?: string | null
  creativeType?: string | null
  className?: string
}

export default function AutopostMedia({ mediaUrl, posterUrl, creativeType, className }: AutopostMediaProps) {
  const safeMediaUrl = isSafeExternalUrl(mediaUrl) ? mediaUrl : null
  const safePosterUrl = isSafeExternalUrl(posterUrl) ? posterUrl : null
  const kind = inferMediaKind(safeMediaUrl ?? safePosterUrl, creativeType)

  if (!safeMediaUrl && !safePosterUrl) {
    return null
  }

  if (kind === 'video' && safeMediaUrl) {
    return (
      <div className={`overflow-hidden rounded-2xl border border-white/10 ${className ?? ''}`}>
        <video
          controls
          playsInline
          preload="metadata"
          poster={safePosterUrl ?? safeMediaUrl}
          className="h-60 w-full object-cover"
        >
          <source src={safeMediaUrl} />
          Your browser does not support embedded videos.
        </video>
      </div>
    )
  }

  const fallback = safeMediaUrl ?? safePosterUrl!

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 ${className ?? ''}`}>
      <Image
        src={fallback}
        alt="Campaign media"
        width={1200}
        height={675}
        unoptimized
        className="h-60 w-full object-cover"
      />
    </div>
  )
}
