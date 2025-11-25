import { IconLabel, Row } from '@entro314labs/entro-zen';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { useMessages, useNavigation, useWebsite } from '@/components/hooks';
import { ArrowLeft, Globe } from '@/components/icons';

export function WebsiteSettingsHeader() {
  const website = useWebsite();
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <>
      <Row marginTop="6">
        <Link href={renderUrl(`/websites/${website?.websiteId}`)}>
          <IconLabel icon={<ArrowLeft />} label={formatMessage(labels.website)} />
        </Link>
      </Row>
      <PageHeader title={website?.name} description={website?.domain} icon={<Globe />} />
    </>
  );
}
