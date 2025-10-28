'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'

export interface ProfileAvatarUploaderProps {
  avatarUrl?: string
  onUpload?: (file: File) => Promise<string | void> | string | void
  onRemove?: () => Promise<void> | void
}

export function ProfileAvatarUploader({ avatarUrl, onUpload, onRemove }: ProfileAvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(avatarUrl)
  const [objectUrl, setObjectUrl] = useState<string | undefined>()
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setObjectUrl(previewUrl)

    try {
      setIsUploading(true)
      const result = await onUpload?.(file)
      if (typeof result === 'string') {
        setPreview(result)
        setObjectUrl(undefined)
      }
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRemove() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      setObjectUrl(undefined)
    }
    setPreview(undefined)
    await onRemove?.()
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-dashed border-white/30 bg-white/10">
        {preview ? (
          <Image src={preview} alt="Profile avatar" fill unoptimized sizes="112px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wide text-white/60">
            No Avatar
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
        <button
          type="button"
          className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white/40 hover:bg-white/10"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? 'Uploading…' : preview ? 'Change Avatar' : 'Upload Avatar'}
        </button>

        {preview && (
          <button
            type="button"
            className="text-xs uppercase tracking-wide text-white/60 hover:text-rose-300"
            onClick={handleRemove}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfileAvatarUploader
