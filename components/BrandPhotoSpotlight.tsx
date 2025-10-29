'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const PLACEHOLDER_IMAGE = '/brand-photo-placeholder.svg'

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

export default function BrandPhotoSpotlight() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const updatePreview = useCallback((file: File | null) => {
    if (!file) {
      return
    }

    if (!isImageFile(file)) {
      setError('Please select an image file (JPG, PNG, or WebP).')
      return
    }

    setError(null)
    setPreviewUrl((current) => {
      if (current && current.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }

      return URL.createObjectURL(file)
    })
  }, [])

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      updatePreview(file ?? null)
    },
    [updatePreview],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setDragActive(false)
      const file = event.dataTransfer.files?.[0]
      updatePreview(file ?? null)
    },
    [updatePreview],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (!dragActive) {
      setDragActive(true)
    }
  }, [dragActive])

  const onDragLeave = useCallback(() => {
    setDragActive(false)
  }, [])

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const imageSource = previewUrl ?? PLACEHOLDER_IMAGE
  const hasCustomImage = Boolean(previewUrl)

  return (
    <section className="glass relative overflow-hidden rounded-xl border border-white/10 bg-[#101731]/80 p-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-magnolia/10 via-transparent to-brand-cypress/10" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brand-mist/60">Brand Spotlight</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Show your hybrid glow</h3>
          <p className="mt-1 text-sm text-brand-mist/80">
            Drop in your own photo to see it framed with the Digital Magnolia treatment.
          </p>
        </div>
        <button
          type="button"
          onClick={openFilePicker}
          className="relative rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-brand-mist transition hover:border-brand-cypress/60 hover:text-white"
        >
          Upload
        </button>
      </div>

      <label
        className={`relative mt-4 flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${dragActive ? 'border-brand-cypress/80 bg-brand-cypress/10' : 'border-white/10 bg-[#0d142c]/80 hover:border-brand-magnolia/60 hover:bg-[#111a35]/80'}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="absolute inset-0">
          <Image
            src={imageSource}
            alt={hasCustomImage ? 'Uploaded brand photo' : 'Digital Magnolia placeholder portrait'}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            loading="lazy"
            unoptimized={hasCustomImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1024]/80 via-transparent to-[#0a1024]/20" />
          <div className="absolute inset-4 rounded-3xl border border-white/15" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brand-mist/80">
            {hasCustomImage ? 'Preview Active' : 'Drop Photo'}
          </span>
          <p className="max-w-[220px] text-xs text-brand-mist/75">
            {hasCustomImage ? 'Your photo is now wrapped in the MarAI glow.' : 'Drag & drop or click to upload a JPG, PNG, or WebP.'}
          </p>
        </div>
      </label>

      {error ? <p className="mt-3 text-xs font-medium text-[#ff9ecf]">{error}</p> : null}
    </section>
  )
}
