'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import SiteNavbar from '@/components/navigation/SiteNavbar'
import AuthPageNav from '@/components/navigation/AuthPageNav'
import AuthPageFooter from '@/components/navigation/AuthPageFooter'

interface AppChromeProps {
  children: ReactNode
}

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname()
  const isAuthExperience = pathname?.startsWith('/auth')

  return (
    <>
      {isAuthExperience ? <AuthPageNav /> : <SiteNavbar />}
      {children}
      {isAuthExperience ? <AuthPageFooter /> : null}
    </>
  )
}
