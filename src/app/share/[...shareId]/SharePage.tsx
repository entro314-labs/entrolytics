'use client'
import { Column } from '@entro314labs/entro-zen'
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider'
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage'
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader'
import { useShareTokenQuery } from '@/components/hooks'
import { PageBody } from '@/components/common/PageBody'
import { Header } from './Header'
import { Footer } from './Footer'

export function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId)

  if (isLoading || !shareToken) {
    return null
  }

  return (
    <Column backgroundColor="2">
      <PageBody gap>
        <Header />
        <WebsiteProvider websiteId={shareToken.websiteId}>
          <WebsiteHeader showActions={false} />
          <WebsitePage websiteId={shareToken.websiteId} />
        </WebsiteProvider>
        <Footer />
      </PageBody>
    </Column>
  )
}
