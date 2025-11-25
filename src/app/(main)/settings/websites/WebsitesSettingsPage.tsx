'use client';
import { Column } from '@entro314labs/entro-zen';
import { WebsitesDataTable } from '@/app/(main)/websites/WebsitesDataTable';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';

export function WebsitesSettingsPage({ orgId }: { orgId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.websites)} />
      <WebsitesDataTable orgId={orgId} />
    </Column>
  );
}
