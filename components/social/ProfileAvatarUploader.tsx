'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UploadCloud, X } from 'lucide-react'

interface ProfileAvatarUploaderProps {
  avatarUrl?: string
  onUpload: (file: File) => void
  onRemove: () => void
}

export function ProfileAvatarUploader({ avatarUrl, onUpload, onRemove }: ProfileAvatarUploaderProps) {
  const [preview, setPreview] = useState<string | undefined>(avatarUrl)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onUpload(file)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    onRemove()
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-28 w-28 rounded-full border-2 border-dashed border-white/20 bg-gray-800">
        {preview ? (
          <>
            <Image src={preview} alt="Profile avatar" fill unoptimized sizes="112px" className="rounded-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0 right-0 rounded-full bg-red-500 p-1 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer items-center justify-center">
            <UploadCloud className="h-8 w-8 text-gray-500" />
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>
      <div className="text-xs text-brand-mist/60">
        <p>Upload a custom avatar.</p>
        <p>Recommended size: 256x256</p>
      </div>
    </div>
  )
}
