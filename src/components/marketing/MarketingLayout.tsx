'use client'

import { type ReactNode } from 'react'
import { Navbar } from '@/app/landing/components/Navbar'
import { CustomCursor } from '@/app/landing/components/CustomCursor'
import { MarketingFooter } from './MarketingFooter'
// Marketing fonts
import '@fontsource/geologica/300.css'
import '@fontsource/geologica/400.css'
import '@fontsource/geologica/500.css'
import '@fontsource/geologica/600.css'
import '@fontsource/geologica/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@/styles/marketing.css'
import styles from './MarketingLayout.module.css'

interface MarketingLayoutProps {
  children: ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className={styles.main}>{children}</main>
      <MarketingFooter />
    </>
  )
}
