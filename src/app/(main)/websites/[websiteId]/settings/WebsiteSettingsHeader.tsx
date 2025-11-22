import Link from 'next/link'
import { IconLabel, Row } from '@entro314labs/entro-zen'
import { PageHeader } from '@/components/common/PageHeader'
import { Globe, ArrowLeft } from '@/components/icons'
import { useMessages, useNavigation, useWebsite } from '@/components/hooks'

export function WebsiteSettingsHeader() {
  const website = useWebsite()
  const { formatMessage, labels } = useMessages()
  const { renderUrl } = useNavigation()

  return (
    <>
      <Row marginTop="6">
        <Link href={renderUrl(`/websites/${website?.websiteId}`)}>
          <IconLabel icon={<ArrowLeft />} label={formatMessage(labels.website)} />
        </Link>
      </Row>
      <PageHeader title={website?.name} description={website?.domain} icon={<Globe />} />
    </>
  )
}
