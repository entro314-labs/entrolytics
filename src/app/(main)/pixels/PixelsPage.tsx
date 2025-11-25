'use client';
import { Column } from '@entro314labs/entro-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation } from '@/components/hooks';
import { PixelAddButton } from './PixelAddButton';
import { PixelsDataTable } from './PixelsDataTable';

export function PixelsPage() {
  const { formatMessage, labels } = useMessages();
  const { orgId } = useNavigation();

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.pixels)}>
          <PixelAddButton orgId={orgId} />
        </PageHeader>
        <Panel>
          <PixelsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
