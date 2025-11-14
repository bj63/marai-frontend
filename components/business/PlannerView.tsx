'use client'

import { useState } from 'react'
import CampaignBriefForm from '@/components/business/CampaignBriefForm'
import CreativePreviewCard from '@/components/business/CreativePreviewCard'
import QueueTimeline from '@/components/business/QueueTimeline'
import { useBusinessData } from '@/components/business/BusinessDataContext'
import type { AutopostQueueEntry } from '@/types/business'

export default function PlannerView() {
  const { autoposts, loadingAutoposts, autopostError, refreshAutoposts } = useBusinessData()
  const [previewEntry, setPreviewEntry] = useState<AutopostQueueEntry | null>(null)
  const [duplicateEntry, setDuplicateEntry] = useState<AutopostQueueEntry | null>(null)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-8">
        <CampaignBriefForm
          duplicateEntry={duplicateEntry}
          onClearDuplicate={() => setDuplicateEntry(null)}
          onCreativeGenerated={(entry) => {
            setPreviewEntry(entry)
            setDuplicateEntry(null)
            refreshAutoposts()
          }}
        />
        <QueueTimeline
          entries={autoposts}
          loading={loadingAutoposts}
          error={autopostError}
          onSelectEntry={(entry) => setPreviewEntry(entry)}
          onDuplicateEntry={(entry) => setDuplicateEntry(entry)}
        />
      </div>
      <div className="flex flex-col gap-6">
        <CreativePreviewCard entry={previewEntry} />
      </div>
    </div>
  )
}
