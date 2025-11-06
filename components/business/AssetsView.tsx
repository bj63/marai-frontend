'use client'

import Image from 'next/image'
import { FolderDown } from 'lucide-react'
import { useBusinessData, type BusinessDataContextValue } from '@/components/business/BusinessDataContext'

const collectAssets = (autoposts: BusinessDataContextValue['autoposts']) => {
  const assets: Array<{ id: string; title: string; type: string; url: string | null }> = []
  autoposts.forEach((entry) => {
    const details = entry.details
    if (details?.posterUrl) {
      assets.push({ id: `${entry.id}-poster`, title: details.title ?? `Poster ${entry.id}`, type: 'image', url: details.posterUrl })
    }
    if (details?.mediaUrl && details.mediaUrl !== details.posterUrl) {
      assets.push({ id: `${entry.id}-media`, title: details.title ?? `Media ${entry.id}`, type: 'video', url: details.mediaUrl })
    }
    if (entry.body) {
      assets.push({ id: `${entry.id}-copy`, title: details?.title ?? `Copy ${entry.id}`, type: 'copy', url: null })
    }
  })
  return assets
}

export default function AssetsView() {
  const { autoposts } = useBusinessData()
  const assets = collectAssets(autoposts)

  if (assets.length === 0) {
    return <p className="text-sm text-slate-400">No creative assets stored yet. Generate campaigns to populate this library.</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {assets.map((asset) => (
        <article key={asset.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
            <span>{asset.type}</span>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] text-white transition hover:bg-white/10">
              <FolderDown className="h-3.5 w-3.5" /> Export
            </button>
          </div>
          <h4 className="mt-3 text-sm font-semibold text-white">{asset.title}</h4>
          {asset.type === 'copy' ? (
            <p className="mt-3 text-sm text-slate-300">
              {autoposts.find((entry) => `${entry.id}-copy` === asset.id)?.body.slice(0, 200)}
            </p>
          ) : asset.url ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <Image src={asset.url} alt={asset.title} width={800} height={600} className="h-40 w-full object-cover" />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
