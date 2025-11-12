'use client'

import AutopostCard from '@/components/business/autopost/AutopostCard'
import { useBusinessData } from '@/components/business/BusinessDataContext'

export default function PostsView() {
  const { autoposts, loadingAutoposts, autopostError } = useBusinessData()

  if (loadingAutoposts) {
    return <p className="text-sm text-slate-400">Loading promoted and organic drops…</p>
  }

  if (autopostError) {
    return <p className="text-sm text-rose-200">{autopostError}</p>
  }

  if (autoposts.length === 0) {
    return <p className="text-sm text-slate-400">No campaigns scheduled yet. Generate a brief to get started.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {autoposts.map((entry) => (
        <AutopostCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
