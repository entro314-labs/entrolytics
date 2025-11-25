'use client';
import { Column } from '@entro314labs/entro-zen';
import { OrgsDataTable } from '@/app/(main)/orgs/OrgsDataTable';
import { OrgsHeader } from '@/app/(main)/orgs/OrgsHeader';
import { Panel } from '@/components/common/Panel';

export function OrgsSettingsPage() {
  return (
    <Column gap="6">
      <OrgsHeader />
      <Panel>
        <OrgsDataTable />
      </Panel>
    </Column>
  );
}
