import { usePixel, useMessages, useSlug } from '@/components/hooks'
import { PageHeader } from '@/components/common/PageHeader'
import { Icon, Text } from '@entro314labs/entro-zen'
import { ExternalLink, Zap as Pixel } from '@/components/icons'
import { LinkButton } from '@/components/common/LinkButton'

export function PixelHeader() {
  const { formatMessage, labels } = useMessages()
  const { getSlugUrl } = useSlug('pixel')
  const pixel = usePixel()

  return (
    <PageHeader title={pixel.name} icon={<Pixel />}>
      <LinkButton href={getSlugUrl(pixel.slug)} target="_blank" prefetch={false}>
        <Icon>
          <ExternalLink />
        </Icon>
        <Text>{formatMessage(labels.view)}</Text>
      </LinkButton>
    </PageHeader>
  )
}
