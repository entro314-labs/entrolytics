'use client';
import { Column } from '@entro314labs/entro-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { WebsiteAddButton } from './WebsiteAddButton';
import { WebsitesDataTable } from './WebsitesDataTable';

export function WebsitesPage() {
  const { orgId } = useNavigation();
  const { formatMessage, labels } = useMessages();

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.websites)}>
          <WebsiteAddButton orgId={orgId} />
        </PageHeader>
        <Panel>
          <WebsitesDataTable orgId={orgId} />
        </Panel>
      </Column>
    </PageBody>
  );
}
