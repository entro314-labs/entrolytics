'use client'
import { Grid, Loading, Column, Row } from '@entro314labs/entro-zen'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { UpdateNotice } from './UpdateNotice'
import { SideNav } from '@/app/(main)/SideNav'
import { MobileNav } from '@/app/(main)/MobileNav'
import { useLoginQuery, useConfig } from '@/components/hooks'
import { useRouter } from 'next/navigation'
import { LAST_ORG_CONFIG } from '@/lib/constants'
import { getItem, setItem } from '@/lib/storage'

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery()
  const config = useConfig()
  const pathname = usePathname()
  const router = useRouter()

  // Redirect to last org on initial websites page load
  useEffect(() => {
    if (pathname === '/websites') {
      const lastOrg = getItem(LAST_ORG_CONFIG)
      if (lastOrg) {
        router.replace(`/orgs/${lastOrg}/websites`)
      }
    }
  }, [pathname, router])

  // Remember last visited org
  useEffect(() => {
    const orgMatch = pathname.match(/\/orgs\/([^/]+)/)
    if (orgMatch?.[1]) {
      setItem(LAST_ORG_CONFIG, orgMatch[1])
    }
  }, [pathname])

  if (isLoading) {
    return <Loading placement="absolute" />
  }

  if (error) {
    window.location.href = `${process.env.basePath || ''}/sign-in`
    return null
  }

  if (!user || !config) {
    return null
  }

  return (
    <Grid
      columns={{ xs: '1fr', lg: 'auto 1fr' }}
      rows={{ xs: 'auto 1fr', lg: '1fr' }}
      height={{ xs: 'auto', lg: '100vh' }}
      width="100%"
    >
      <Row display={{ xs: 'flex', lg: 'none' }} alignItems="center" gap padding="3">
        <MobileNav />
      </Row>
      <Column display={{ xs: 'none', lg: 'flex' }}>
        <SideNav />
      </Column>
      <Column alignItems="center" overflowY="auto" overflowX="hidden" position="relative">
        {children}
      </Column>
      <UpdateNotice user={user} config={config} />
      {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
        <Script src={`${process.env.basePath || ''}/telemetry.js`} />
      )}
    </Grid>
  )
}
