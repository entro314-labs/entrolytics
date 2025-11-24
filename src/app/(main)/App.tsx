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
import { useUser } from '@clerk/nextjs'

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery()
  const { user: clerkUser } = useUser()
  const config = useConfig()
  const pathname = usePathname()
  const router = useRouter()

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (!isLoading && user && clerkUser) {
      const onboardingCompleted = clerkUser.publicMetadata?.onboardingCompleted === true
      const onboardingSkipped = clerkUser.publicMetadata?.onboardingSkipped === true

      // If onboarding not completed and not on onboarding page, redirect
      if (!onboardingCompleted && !onboardingSkipped && !pathname.startsWith('/onboarding')) {
        router.replace('/onboarding')
        return
      }
    }
  }, [user, clerkUser, isLoading, pathname, router])

  // Redirect to last org on initial websites page load (only if onboarding complete)
  // Also verify user is actually a member of that org
  useEffect(() => {
    if (pathname === '/websites' && user && clerkUser) {
      const onboardingCompleted = clerkUser.publicMetadata?.onboardingCompleted === true
      const onboardingSkipped = clerkUser.publicMetadata?.onboardingSkipped === true

      // Only redirect to last org if user has completed/skipped onboarding
      if (onboardingCompleted || onboardingSkipped) {
        const lastOrg = getItem(LAST_ORG_CONFIG)
        // Clear the lastOrg from storage - we'll verify it's valid first
        if (lastOrg) {
          // TODO: Verify user is member of this org before redirecting
          // For now, just clear it to prevent 401 errors for new users
          // They'll need to select an org from the orgs page
          setItem(LAST_ORG_CONFIG, '')
        }
      }
    }
  }, [pathname, router, user, clerkUser])

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
