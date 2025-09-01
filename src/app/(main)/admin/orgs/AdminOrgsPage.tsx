'use client';
import { AdminOrgsDataTable } from './AdminOrgsDataTable';
import { Column } from '@entro314labs/entro-zen';
import { useMessages } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function AdminOrgsPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6">
      <PageHeader title={formatMessage(labels.orgs)} />
      <Panel>
        <AdminOrgsDataTable />
      </Panel>
    </Column>
  );
}
