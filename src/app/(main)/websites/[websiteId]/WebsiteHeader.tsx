import { Icon, Text, Row } from '@entro314labs/entro-zen'
import { PageHeader } from '@/components/common/PageHeader'
import { Share, Edit } from '@/components/icons'
import { Favicon } from '@/components/common/Favicon'
import { ActiveUsers } from '@/components/metrics/ActiveUsers'
import { WebsiteShareForm } from '@/app/(main)/websites/[websiteId]/settings/WebsiteShareForm'
import { useMessages, useNavigation, useWebsite } from '@/components/hooks'
import { LinkButton } from '@/components/common/LinkButton'
import { DialogButton } from '@/components/input/DialogButton'

export function WebsiteHeader({ showActions = true }: { showActions?: boolean }) {
  const website = useWebsite()
  const { renderUrl, pathname } = useNavigation()
  const isSettings = pathname.endsWith('/settings')

  if (isSettings) {
    return null
  }

  return (
    <PageHeader title={website.name} icon={<Favicon domain={website.domain} />}>
      <Row alignItems="center" gap="6">
        <ActiveUsers websiteId={website.websiteId} />
        {showActions && (
          <Row
            display={{ xs: 'none', sm: 'none', md: 'none', lg: 'flex', xl: 'flex' }}
            alignItems="center"
            gap
          >
            <ShareButton websiteId={website.websiteId} shareId={website.shareId} />
            <LinkButton href={renderUrl(`/websites/${website.websiteId}/settings`, false)}>
              <Icon>
                <Edit />
              </Icon>
              <Text>Edit</Text>
            </LinkButton>
          </Row>
        )}
      </Row>
    </PageHeader>
  )
}

const ShareButton = ({ websiteId, shareId }) => {
  const { formatMessage, labels } = useMessages()

  return (
    <DialogButton icon={<Share />} label={formatMessage(labels.share)} width="800px">
      {({ close }) => {
        return <WebsiteShareForm websiteId={websiteId} shareId={shareId} onClose={close} />
      }}
    </DialogButton>
  )
}
