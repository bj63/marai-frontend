import type { ReactNode } from 'react'
import BusinessShell from '@/components/business/BusinessShell'
import type { BusinessProfile } from '@/types/business'

const companyProfile: BusinessProfile = {
  id: 'marai-labs',
  name: 'MarAI Labs',
  tagline: 'Personalised, emotionally-aware autoposts for every campaign ritual.',
  verified: true,
  sectors: ['AI', 'Marketing', 'Sentiment'],
  headquarters: 'Los Angeles, CA',
  website: 'https://marai.studio',
}

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return <BusinessShell company={companyProfile}>{children}</BusinessShell>
}
